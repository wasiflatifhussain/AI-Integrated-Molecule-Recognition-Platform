#!/usr/bin/env python3 -u
# Copyright (c) DP Techonology, Inc. and its affiliates.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

import logging
import os
import sys
import pickle
import torch
from unicore import checkpoint_utils, distributed_utils, options, utils
from unicore.logging import progress_bar
from unicore import tasks

from rdkit import Chem
from rdkit.Chem import Draw

import pandas as pd

import lmdb
import pandas as pd
import numpy as np

from tqdm import tqdm
from rdkit.Chem import AllChem
from rdkit.Chem.Scaffolds import MurckoScaffold
from rdkit import RDLogger
RDLogger.DisableLog('rdApp.*')  
import warnings
warnings.filterwarnings(action='ignore')
from multiprocessing import Pool

# logging.basicConfig(
#     format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
#     datefmt="%Y-%m-%d %H:%M:%S",
#     level=os.environ.get("LOGLEVEL", "INFO").upper(),
#     stream=sys.stdout,
# )
# logger = logging.getLogger("unimol.inference")





def smi2_2Dcoords(smi):
    mol = Chem.MolFromSmiles(smi)
    mol = AllChem.AddHs(mol)
    AllChem.Compute2DCoords(mol)
    coordinates = mol.GetConformer().GetPositions().astype(np.float32)
    len(mol.GetAtoms()) == len(coordinates), "2D coordinates shape is not align with {}".format(smi)
    return coordinates

def smi2_3Dcoords(smi,cnt):
    mol = Chem.MolFromSmiles(smi)
    mol = AllChem.AddHs(mol)
    coordinate_list=[]
    for seed in range(cnt):
        try:
            res = AllChem.EmbedMolecule(mol, randomSeed=1)  # will random generate conformer with seed equal to -1. else fixed random seed.
            if res == 0:
                try:
                    AllChem.MMFFOptimizeMolecule(mol)       # some conformer can not use MMFF optimize
                    coordinates = mol.GetConformer().GetPositions()
                except:
                    print("Failed to generate 3D, replace with 2D")
                    coordinates = smi2_2Dcoords(smi)            
                    
            elif res == -1:
                mol_tmp = Chem.MolFromSmiles(smi)
                AllChem.EmbedMolecule(mol_tmp, maxAttempts=5000, randomSeed=1)
                mol_tmp = AllChem.AddHs(mol_tmp, addCoords=True)
                try:
                    AllChem.MMFFOptimizeMolecule(mol_tmp)       # some conformer can not use MMFF optimize
                    coordinates = mol_tmp.GetConformer().GetPositions()
                except:
                    print("Failed to generate 3D, replace with 2D")
                    coordinates = smi2_2Dcoords(smi) 
        except:
            print("Failed to generate 3D, replace with 2D")
            coordinates = smi2_2Dcoords(smi) 

        assert len(mol.GetAtoms()) == len(coordinates), "3D coordinates shape is not align with {}".format(smi)
        coordinate_list.append(coordinates.astype(np.float32))
    return coordinate_list

def inner_smi2coords(smiles):
    smi = smiles
    # ori_index = content[1]
    target = (0,0,0,0,0)
    cnt = 10 # conformer num,all==11, 10 3d + 1 2d

    mol = Chem.MolFromSmiles(smi)
    if len(mol.GetAtoms()) > 400:
        coordinate_list =  [smi2_2Dcoords(smi)] * (cnt+1)
        print("atom num >400,use 2D coords",smi)
    else:
        coordinate_list = smi2_3Dcoords(smi,cnt)
        coordinate_list.append(smi2_2Dcoords(smi).astype(np.float32))
    mol = AllChem.AddHs(mol)
    atoms = [atom.GetSymbol() for atom in mol.GetAtoms()]  # after add H 
    scaffold = MurckoScaffold.GetScaffoldForMol(mol)
    scaffold_smiles = Chem.MolToSmiles(scaffold)
    return pickle.dumps({'atoms': atoms, 'coordinates': coordinate_list, 'smi': smi, 'target': target
                        }, protocol=-1)

def smi2coords(smiles_list):
    try:
        return inner_smi2coords(smiles_list)
    except:
        print("failed smiles: {}".format(smiles_list[0]))
        return None

def write_lmdb(smiles_list, job_name, outpath='./results', nthreads=16):
    os.makedirs(outpath, exist_ok=True)
    output_name = os.path.join(outpath,'{}.lmdb'.format(job_name))
    try:
        os.remove(output_name)
    except:
        pass
    env_new = lmdb.open(
        output_name,
        subdir=False,
        readonly=False,
        lock=False,
        readahead=False,
        meminit=False,
        max_readers=1,
        map_size=int(100e9),
    )
    txn_write = env_new.begin(write=True)
    with Pool(nthreads) as pool: # 创建线程池，用于并行处理数据
        i = 0
        for inner_output in pool.imap(smi2coords, smiles_list):
            if inner_output is not None:
                txn_write.put(f'{i}'.encode("ascii"), inner_output) # 将处理后的数据写入LMDB事务
                i += 1
        txn_write.commit()
        env_new.close()

def main(args):
    assert (
        args.batch_size is not None
    ), "Must specify batch size either with --batch-size"

    use_fp16 = args.fp16
    use_cuda = torch.cuda.is_available() and not args.cpu

    if use_cuda:
        torch.cuda.set_device(args.device_id)

    if args.distributed_world_size > 1:
        data_parallel_world_size = distributed_utils.get_data_parallel_world_size()
        data_parallel_rank = distributed_utils.get_data_parallel_rank()
    else:
        data_parallel_world_size = 1
        data_parallel_rank = 0

    # Load model
    # logger.info("loading model(s) from {}".format(args.path))
    state = checkpoint_utils.load_checkpoint_to_cpu(args.path)
    task = tasks.setup_task(args)
    model = task.build_model(args)
    model.load_state_dict(state["model"], strict=False)
    # Move models to GPU
    if use_fp16:
        model.half()
    if use_cuda:
        model.cuda()

    # Print args
    # logger.info(args)

    # Build loss
    loss = task.build_loss(args)
    loss.eval()

    for subset in args.valid_subset.split(","):
        try:
            task.load_dataset(subset, combine=False, epoch=1)
            dataset = task.dataset(subset)
            # logger.info(dataset)
        except KeyError:
            raise Exception("Cannot find dataset: " + subset)

        if not os.path.exists(args.results_path):
            os.makedirs(args.results_path)
            
        # fname = (args.path).split("/")[-2]
        # save_path = os.path.join(args.results_path, fname + "_" + subset + ".out.pkl")
        # save_path = os.path.join("./" + subset + ".out.pkl")
        # Initialize data iterator
        itr = task.get_batch_iterator(
            dataset=dataset,
            batch_size=args.batch_size,
            ignore_invalid_inputs=True,
            required_batch_size_multiple=args.required_batch_size_multiple,
            seed=args.seed,
            num_shards=data_parallel_world_size,
            shard_id=data_parallel_rank,
            num_workers=args.num_workers,
            data_buffer_size=args.data_buffer_size,
        ).next_epoch_itr(shuffle=False)
        progress = progress_bar.progress_bar(
            itr,
            log_format=args.log_format,
            log_interval=args.log_interval,
            prefix=f"valid on '{subset}' subset",
            default_log_format=("tqdm" if not args.no_progress_bar else "simple"),
        )

        log_outputs = []

        data_metainfo = {
        "BN_648_cam_b3lyp": {
        "mean": [3.218297222, 3.689759105, 3.217428858, 
                 -1.752622865, -5.061926358],
        "std": [0.226148499, 0.282869479, 0.227074731,
                0.370901885, 0.331173442],
        "target_name": ["ES1", "ES2", "ET1","LUMO","HOMO"],
            },
        "BH407": {
        "mean": [-5.158344914004912,-1.8654196314496314,
                 3.017020638820639,1.6748928746928746],
        "std": [0.1798662435968609,0.1785218190004332,
                0.24526115751540792,0.18191493985704862],
        "target_name": ["HOMO", "LUMO", "S1","T1"],
        },
        }
        
        for i, sample in enumerate(progress):
            sample = utils.move_to_cuda(sample) if use_cuda else sample
            if len(sample) == 0:
                continue
            model.eval()
            with torch.no_grad():
                net_output = model(
            **sample["net_input"],
            features_only=True,
            classification_head_name=args.classification_head_name,
        )
            
            reg_output = net_output[0]

            if args.classification_head_name == 'BH407' :
                targets_mean = torch.tensor(data_metainfo['BH407']["mean"], device=reg_output.device)
                targets_std = torch.tensor(data_metainfo['BH407']["std"], device=reg_output.device)
                reg_output = reg_output * targets_std + targets_mean  
            elif args.classification_head_name == 'BN_648_cam_b3lyp' :
                targets_mean = torch.tensor(data_metainfo['BN_648_cam_b3lyp']["mean"], device=reg_output.device)
                targets_std = torch.tensor(data_metainfo['BN_648_cam_b3lyp']["std"], device=reg_output.device)
                reg_output = reg_output * targets_std + targets_mean
            logging_output = {
                "predict": reg_output.view(-1, args.num_classes).data,
                "smi_name": sample["smi_name"],
                "num_task": args.num_classes,
                "conf_size":args.conf_size,
                "bsz": sample["target"]["finetune_target"].size(0),
            }
            log_outputs.append(logging_output)
        smi_list, predict_list = [], []
        predict = log_outputs
        for batch in predict:
            sz = batch['bsz']
            for i in range(sz):
                smi_list.append(batch["smi_name"][i])
                predict_list.append(batch["predict"][i].cpu().tolist())
        predict_df = pd.DataFrame({"SMILES": smi_list, "predict": predict_list})
        if len(predict_list[0]) == 4 :
            if len(predict_list) == 1 and batch_boolean == "false":
                smi_name = smi_list[0]
                predict = predict_list[0]
                # S1, S2, T1, LUMO, HOMO = predict[:5]
                HOMO, LUMO, S1, T1= predict[:4]
                # print(f'HOMO:{HOMO:.4f}, LUMO:{LUMO:.4f}, S1:{S1:.4f}, T1:{T1:.4f}, S2:{S2:.4f}')
                print(f'HOMO:{HOMO:.4f}, LUMO:{LUMO:.4f}, S1:{S1:.4f}, T1:{T1:.4f}')
                print(user_name)
            elif len(predict_list) > 1 or batch_boolean == "true":
                predict_df[['HOMO', 'LUMO', 'S1','T1']]= pd.DataFrame(predict_df['predict'].to_list(), columns=['HOMO', 'LUMO', 'S1','T1'], index = predict_df.index )
                predict_df = predict_df.drop(columns=['predict'])
                predict_df.to_csv(f'./molecule_file_BH_{args.valid_subset}.csv',index=False)

        if len(predict_list[0]) == 5 :
            if len(predict_list) == 1 and batch_boolean == "false":
                smi_name = smi_list[0]
                predict = predict_list[0]
                S1, S2, T1, LUMO, HOMO = predict[:5]
                print(f'HOMO:{HOMO:.4f}, LUMO:{LUMO:.4f}, S1:{S1:.4f}, T1:{T1:.4f}')

            elif len(reg_output) > 1 or batch_boolean == "true":
                predict_df[['S1', 'S2', 'T1', 'LUMO', 'HOMO']]= pd.DataFrame(predict_df['predict'].to_list(), columns=['S1', 'S2', 'T1', 'LUMO', 'HOMO'], index = predict_df.index )
                predict_df = predict_df.drop(columns=['predict','S2'])
                predict_df = predict_df.reindex(columns=['SMILES','HOMO', 'LUMO', 'S1','T1'])
                predict_df.to_csv(f'./molecule_file_BN_{args.valid_subset}.csv',index=False)
    return None


def cli_main(input_args):
    parser = options.get_validation_parser()
    options.add_model_args(parser)
    args = options.parse_args_and_arch(parser,input_args)
    # main(args,user_name)
    distributed_utils.call_main(args, main)

if __name__ == "__main__":
    
    user_name = sys.argv[1]
    batch_boolean = sys.argv[2]
    
    molecular_path='./molecule_file' # path that lmdb file saved
    data_path="./"  # replace to your data path
    results_path= './'  # replace to your results path
    weight_path='./BN648_cam_b3lyp_checkpoint_best.pt'  # replace to your ckpt path
    predict_path=f"./{user_name}.out.pkl"  # replace to your results path
    batch_size=32
    task_name='molecule_file' # data folder name 
    task_num=5
    loss_func='finetune_smooth_mae'
    dict_name='dict.txt'
    conf_size=1
    only_polar=0
    
    input_args = ["--user-dir", "./unimol", data_path,
              "--task-name", task_name,"--valid-subset", user_name, "--results-path", results_path,
              "--num-workers", "8", "--ddp-backend", "c10d", "--batch-size", str(batch_size), "--task","mol_finetune",
              "--loss", loss_func, "--arch","unimol_base","--classification-head-name", "BN_648_cam_b3lyp",
              "--num-classes", str(task_num), "--dict-name", dict_name, "--conf-size", str(conf_size),
              "--only-polar", str(only_polar), "--path", weight_path,"--fp16", "--fp16-init-scale", "4",
              "--fp16-scale-window", "256", "--log-interval", "50", "--log-format", "simple"]
    
    os.environ['CUDA_VISIBLE_DEVICES'] = '0'
    cli_main(input_args)
