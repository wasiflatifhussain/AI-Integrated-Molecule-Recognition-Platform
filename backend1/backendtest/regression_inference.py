# # -*- coding: utf-8 -*-
# #
# # Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# # SPDX-License-Identifier: Apache-2.0

# import json
# import os
# import pandas as pd
# import torch
# import sys

# from dgllife.data import UnlabeledSMILES
# from dgllife.utils import mol_to_bigraph
# from functools import partial
# from torch.utils.data import DataLoader
# from tqdm import tqdm
# from io import StringIO

# from utils import mkdir_p, collate_molgraphs_unlabeled, load_model, predict, init_featurizer

# def main(args):
#     dataset = UnlabeledSMILES(args['smiles'], node_featurizer=args['node_featurizer'],
#                               edge_featurizer=args['edge_featurizer'],
#                               mol_to_graph=partial(mol_to_bigraph, add_self_loop=True))
#     # print("argstype: ",type(args['smiles']))
#     # print(args)
#     dataloader = DataLoader(dataset, batch_size=args['batch_size'],
#                             collate_fn=collate_molgraphs_unlabeled, num_workers=args['num_workers'])
#     model = load_model(args).to(args['device'])
#     checkpoint = torch.load(args['train_result_path'] + '/model.pth', map_location='cpu')
#     model.load_state_dict(checkpoint['model_state_dict'])
#     model.eval()

#     smiles_list = []
#     predictions = []

#     with torch.no_grad():
#         for batch_id, batch_data in enumerate(tqdm(dataloader, desc="Iteration")):
#             batch_smiles, bg = batch_data
#             smiles_list.extend(batch_smiles)
#             batch_pred = predict(args, model, bg)
#             predictions.append(batch_pred.detach().cpu())

#     predictions = torch.cat(predictions, dim=0)
#     # # predictions.sort()
#     # print(sorted(predictions,key=lambda x: x[1]))
#     #print(type(predictions))
#     # predictions.sort(axis=0)
#     print(predictions)

#     output_data = {'canonical_smiles': smiles_list}
#     if args['task_names'] is None:
#         args['task_names'] = ['task_{:d}'.format(t) for t in range(1, args['n_tasks'] + 1)]
#     else:
#         args['task_names'] = args['task_names'].split(',')
#     for task_id, task_name in enumerate(args['task_names']):
#         output_data[task_name] = predictions[:, task_id]
#     df = pd.DataFrame(output_data)
#     df.to_csv(args['inference_result_path'] + '/prediction_'+args['filename'], index=False)

# if __name__ == '__main__':
#     from argparse import ArgumentParser

#     parser = ArgumentParser('Inference for (Multitask) Regression')
#     #
#     parser.add_argument('-d', '--file-dir', type=str, required=True,
#                         help='Path to a .csv/.txt file of SMILES strings')
#     #parser.add_argument('-f', '--file-path', type=str, required=True,
#     #                    help='Path to a .csv/.txt file of SMILES strings')
#     parser.add_argument('-sc', '--smiles-column', type=str,
#                         help='Header for the SMILES column in the CSV file, can be '
#                              'omitted if the input file is a .txt file or the .csv '
#                              'file only has one column of SMILES strings')
#     parser.add_argument('-tp', '--train-result-path', type=str, default='regression_results',
#                         help='Path to the saved training results, which will be used for '
#                              'loading the trained model and related configurations')
#     parser.add_argument('-ip', '--inference-result-path', type=str, default='regression_inference_results',
#                         help='Path to save the inference results')
#     parser.add_argument('-t', '--task-names', default=None, type=str,
#                         help='Task names for saving model predictions in the CSV file to output, '
#                              'which should be the same as the ones used for training. If not '
#                              'specified, we will simply use task1, task2, ...')
#     parser.add_argument('-nw', '--num-workers', type=int, default=0,
#                         help='Number of processes for data loading (default: 1)')
#     args = parser.parse_args().__dict__
#     # print(args)
#     # print(type(args))

#     # Load configuration
#     with open(args['train_result_path'] + '/configure.json', 'r') as f:
#         args.update(json.load(f))

#     if torch.cuda.is_available():
#         args['device'] = torch.device('cuda:0')
#     else:
#         args['device'] = torch.device('cpu')


#     import pandas
#     import os.path

#     #filedir = './BN/'
#     filedir = args['file_dir']+'/'
#     filelist = os.listdir(filedir)
#     # print(filelist)

#     for filename in filelist:
#         print('Processing: '+filedir+filename)
#         # testData = """SMILES
#         #             c3ccc(c1ccccc1c2ccccc2)cc3
#         #             c6ccc(c4ccc(C2CCC(C1CCCC1)C2C3CCCC3)cc4c5ccccc5)cc6
#         #             C7CCCC(c5c(C1CCCCCC1)c(C2CCCCCC2)c(C3CCCCCC3)c(C4CCCCCC4)c5C6CCCCCC6)CC7
#         #             C5CC(C3C(C1CCC1)C(C2CCC2)C3C4CCC4)C5
#         #             c5ccc(C2C3(c1ccccc1)CCCCC23c4ccccc4)cc5
#         #             C7CCC(C5C(C1CCCCC1)C(C2CCCCC2)C(C3CCCCC3)C(C4CCCCC4)C5C6CCCCC6)CC7
#         #             C5CCC(C3CC(C1CCCCC1)C(C2CCC2)C4CCCCC34)CC5"""
                    
#         df = pandas.read_csv(filedir+filename)
#         # df = pandas.read_csv(StringIO(testData))
#         # print(df)
#         smiles = df[df.columns[0]].tolist()
#         # print('smiles  ',smiles)

#         args['smiles'] = smiles
#         args['filename'] = filename

#         args = init_featurizer(args)
#         # Handle directories
#         mkdir_p(args['inference_result_path'])
#         assert os.path.exists(args['train_result_path']), \
#         'The path to the saved training results does not exist.'

#         main(args)

#         args['task_names']=None




# -*- coding: utf-8 -*-
#
# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

import json
import os
import pandas as pd
import torch

from dgllife.data import UnlabeledSMILES
from dgllife.utils import mol_to_bigraph
from functools import partial
from torch.utils.data import DataLoader
from tqdm import tqdm

from utils import mkdir_p, collate_molgraphs_unlabeled, load_model, predict, init_featurizer

def main(args):
    dataset = UnlabeledSMILES(args['smiles'], node_featurizer=args['node_featurizer'],
                              edge_featurizer=args['edge_featurizer'],
                              mol_to_graph=partial(mol_to_bigraph, add_self_loop=True))
    dataloader = DataLoader(dataset, batch_size=args['batch_size'],
                            collate_fn=collate_molgraphs_unlabeled, num_workers=args['num_workers'])
    model = load_model(args).to(args['device'])
    checkpoint = torch.load(args['train_result_path'] + '/model.pth', map_location='cpu')
    model.load_state_dict(checkpoint['model_state_dict'])
    model.eval()

    smiles_list = []
    predictions = []

    with torch.no_grad():
        for batch_id, batch_data in enumerate(tqdm(dataloader, desc="Iteration")):
            batch_smiles, bg = batch_data
            smiles_list.extend(batch_smiles)
            batch_pred = predict(args, model, bg)
            predictions.append(batch_pred.detach().cpu())
            print(batch_smiles)
            print(batch_pred)

    predictions = torch.cat(predictions, dim=0).numpy()
    # print(predictions[0])
    # print(smiles_list[0])

    output_data = {'canonical_smiles': smiles_list}
    if args['task_names'] is None:
        args['task_names'] = ['task_{:d}'.format(t) for t in range(1, args['n_tasks'] + 1)]
    else:
        args['task_names'] = args['task_names'].split(',')
    for task_id, task_name in enumerate(args['task_names']):
        output_data[task_name] = predictions[:, task_id]
    df = pd.DataFrame(output_data)
    df.to_csv(args['inference_result_path'] + '/prediction_'+args['filename'], index=False)

if __name__ == '__main__':
    from argparse import ArgumentParser

    parser = ArgumentParser('Inference for (Multitask) Regression')
    #
    parser.add_argument('-d', '--file-dir', type=str, required=True,
                        help='Path to a .csv/.txt file of SMILES strings')
    #parser.add_argument('-f', '--file-path', type=str, required=True,
    #                    help='Path to a .csv/.txt file of SMILES strings')
    parser.add_argument('-sc', '--smiles-column', type=str,
                        help='Header for the SMILES column in the CSV file, can be '
                             'omitted if the input file is a .txt file or the .csv '
                             'file only has one column of SMILES strings')
    parser.add_argument('-tp', '--train-result-path', type=str, default='regression_results',
                        help='Path to the saved training results, which will be used for '
                             'loading the trained model and related configurations')
    parser.add_argument('-ip', '--inference-result-path', type=str, default='regression_inference_results',
                        help='Path to save the inference results')
    parser.add_argument('-t', '--task-names', default=None, type=str,
                        help='Task names for saving model predictions in the CSV file to output, '
                             'which should be the same as the ones used for training. If not '
                             'specified, we will simply use task1, task2, ...')
    parser.add_argument('-nw', '--num-workers', type=int, default=0,
                        help='Number of processes for data loading (default: 1)')
    args = parser.parse_args().__dict__

    # Load configuration
    with open(args['train_result_path'] + '/configure.json', 'r') as f:
        args.update(json.load(f))

    if torch.cuda.is_available():
        args['device'] = torch.device('cuda:0')
    else:
        args['device'] = torch.device('cpu')


    import pandas
    import os.path

    #filedir = './BN/'
    filedir = args['file_dir']+'/'
    filelist = os.listdir(filedir)
    print(filelist)

    for filename in filelist:
        if filename != '.DS_Store':
            print('Processing: '+filedir+filename)
            df = pandas.read_csv(filedir+filename)
            
            smiles = df[df.columns[0]].tolist()

            args['smiles'] = smiles
            args['filename'] = filename

            args = init_featurizer(args)
            # Handle directories
            mkdir_p(args['inference_result_path'])
            assert os.path.exists(args['train_result_path']), \
            'The path to the saved training results does not exist.'

            main(args)

            args['task_names']=None
