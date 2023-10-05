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

from rdkit import Chem
from rdkit.Chem import Draw

folder = 'GCN-0.005-512-0.05-256-128-3_(07-43)'
folder = 'GCN-0.005-128-0.05-256-128-3_(47-11)'
#folder = 'final'

with open('./'+folder+'/configure.json', 'r') as f:
    args = json.load(f)

if torch.cuda.is_available():
    args['device'] = torch.device('cuda:0')
else:
    args['device'] = torch.device('cpu')

args = init_featurizer(args)

model = load_model(args).to(args['device'])
checkpoint = torch.load('./'+folder+'/model.pth', map_location='cpu')
model.load_state_dict(checkpoint['model_state_dict'])
model.eval()

#smiles = ['CC(C)(C1=CC2=C(SC3=C2N(C(C=C(N4C5=CC=CC=C5C6=C4C=CC=C6)C=C78)=C7B3C9=C(C=C(C=C9)N(C%10=CC=C(C=C%10)C(C)(C)C)C%11=CC=C%12C(C(C=CC=C%13)=C%13O%12)=C%11)N8C(C=C%14)=CC=C%14C(C)(C)C)C(C=C%15)=CC=C%15C(C)(C)C)C=C1)C']
          
# smiles = ['C12=CC=CC3=C1N(C4=CC=CC=C43)C5=C2C=C(C6=NC(C7=CC=CC=C7)=NC(C8=CC=CC=C8)=N6)C=C5']
# smiles = ['c5ccc(c1ccccc1c2cccc4c2ccc3ccccc34)cc5']
# smiles = ['c4ccc(c3cccc(c1ccccc1c2ccccc2)c3)cc4']
smiles = ['c1ccccc1']
          
          
dataset = UnlabeledSMILES(smiles, node_featurizer=args['node_featurizer'],
                          edge_featurizer=args['edge_featurizer'],
                          mol_to_graph=partial(mol_to_bigraph, add_self_loop=True))

dataloader = DataLoader(dataset, collate_fn=collate_molgraphs_unlabeled)

predictions = []
with torch.no_grad():
    for batch_id, batch_data in enumerate((dataloader)):
        batch_smiles, bg = batch_data
        batch_pred = predict(args, model, bg)
        predictions.append(batch_pred.detach().cpu())

predictions = torch.cat(predictions, dim=0)

output=predictions[0].numpy()
#print("[HOMO, LUMO, S1, T1]: ")
#print("[{:.2f}, {:.2f}, {:.2f}, {:.2f}]".format(output[0],output[1],output[2],output[3]))

'''
print("[HOMO, LUMO, S1]: ")
print("[{:.4f}, {:.4f}, {:.4f}]".format(output[0],output[1],output[2]))
'''

print("[HOMO, LUMO, S1, S2]: ")
print("[{:.4f}, {:.4f}, {:.4f}, {:.4f}]".format(output[0],output[1],output[2],output[3]))

#print("[HOMO, LUMO, S1]: ")
#print("[{:.2f}, {:.2f}, {:.2f}]".format(output[0],output[1],output[2]))

# Draw.MolsToGridImage([Chem.MolFromSmiles(smiles[0])], subImgSize=(400, 400))



