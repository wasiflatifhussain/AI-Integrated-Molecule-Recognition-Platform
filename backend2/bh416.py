import os
import subprocess
import pickle
import lmdb
import pandas as pd
import numpy as np
from rdkit import Chem
from rdkit.Chem import Draw
from tqdm import tqdm
from rdkit.Chem import AllChem
from rdkit.Chem.Scaffolds import MurckoScaffold
from rdkit import RDLogger
RDLogger.DisableLog('rdApp.*')  
import warnings
warnings.filterwarnings(action='ignore')
from multiprocessing import Pool


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
    cnt = 1 # conformer num,all==11, 10 3d + 1 2d

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

smi_list = [
'N(c1ccc2c3c1cccc3CC2)(c1c2c(cccc2)c(N(c2ccc3c4c2cccc4CC3)c2ccc3c(c2)c2c(o3)cccc2)c2c1cccc2)c1cc2c3ccccc3oc2cc1'
# 'c1c(cc(cc1c1c2c(c(c3c1cccc3)c1c3c(ccc1)cccc3)cccc2)c1ccc(c2c3c(c(c4c2cccc4)c2c4c(ccc2)cccc4)cccc3)cc1)c1c2c(c(c3c1cccc3)c1c3c(ccc1)cccc3)cccc2'
]


job_name = 'molecule' # lmdb filename
molecular_path='./molecule_file' # path that lmdb file saved
data_path='./'  # replace to your data path
results_path= './'  # replace to your results path
weight_path='./BH416_checkpoint_best.pt'  # replace to your ckpt path
predict_path=f"./{job_name}.out.pkl"  # replace to your results path
batch_size=32
task_name='molecule_file' # data folder name 
task_num=4
loss_func='finetune_smooth_mae'
dict_name='dict.txt'
conf_size=1
only_polar=0
# i=0

write_lmdb(smi_list, job_name=job_name, outpath=molecular_path, nthreads=16)
# !CUDA_VISIBLE_DEVICES="cpu" python ./one_molecular_infer.py --user-dir ../../unimol $data_path \
#        --task-name $task_name --valid-subset $job_name \
#        --results-path $results_path \
#        --num-workers 8 --ddp-backend=c10d --batch-size $batch_size \
#        --task mol_finetune --loss $loss_func --arch unimol_base \
#        --classification-head-name BH416 --num-classes $task_num \
#        --dict-name $dict_name --conf-size $conf_size \
#        --only-polar $only_polar  \
#        --path $weight_path  \
#        --fp16 --fp16-init-scale 4 --fp16-scale-window 256 \
#        --log-interval 50 --log-format simple 

# Modify the following command based on your CUDA setup
subprocess.call(["python", "./one_molecular_infer.py", "--user-dir", "../../unimol", data_path,
                 "--task-name", task_name, "--valid-subset", job_name,
                 "--results-path", results_path,
                 "--num-workers", "8", "--ddp-backend", "c10d", "--batch-size", str(batch_size),
                 "--task", "mol_finetune", "--loss", loss_func, "--arch", "unimol_base",
                 "--classification-head-name", "BH416", "--num-classes", str(task_num),
                 "--dict-name", dict_name, "--conf-size", str(conf_size),
                 "--only-polar", str(only_polar),
                 "--path", weight_path,
                 "--fp16", "--fp16-init-scale", "4", "--fp16-scale-window", "256",
                 "--log-interval", "50", "--log-format", "simple"])


if len(smi_list)==1 :
    Draw.MolsToGridImage([Chem.MolFromSmiles(smi_list[0])], subImgSize=(400, 400))
    