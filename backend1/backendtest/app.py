from flask import Flask, request,jsonify
from rdkit import Chem
from rdkit.Chem import AllChem as Chem
from rdkit.Chem import Draw,rdMolDescriptors,MolToSmiles
from PIL import Image
import base64
from io import BytesIO
from flask_cors import CORS

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

from io import StringIO
import pandas as pd

import matplotlib
matplotlib.use('TkAgg')
import matplotlib.pyplot as plt


from argparse import ArgumentParser
import numpy as np
import re

import sqlite3
import hashlib
import urllib.request

app = Flask(__name__)
CORS(app)

# @app.route("/")
# def index():
#     return app.send_static_file('index.html')

#members route

@app.route("/getImage")
def getImage():
    core = request.args.get("smiles")
    print("smile is: ",core)
    mol = Chem.MolFromSmiles(core)
    if mol is None:
        return "This is not a valid molecule."
    obj = Draw.MolsToGridImage([mol], molsPerRow=7, subImgSize=(300,300))
    buffer = BytesIO()
    obj.save(buffer, format='PNG')  
    obj2 = Draw.MolsToGridImage([mol], molsPerRow=7, subImgSize=(500,500))
    buffer2 = BytesIO()
    obj2.save(buffer2, format='PNG')  
    # Encode the image data as a base64 string
    encoded_image = base64.b64encode(buffer.getvalue()).decode('utf-8')
    encoded_image2 = base64.b64encode(buffer2.getvalue()).decode('utf-8')
    return {'image': encoded_image,'image2':encoded_image2} 
    
    
    
@app.route("/getResult")
def getResult():
    folder = 'GCN-0.005-512-0.05-256-128-3_(07-43)'
    folder = 'GCN-0.005-128-0.05-256-128-3_(47-11)'

    coreSmiles = request.args.get("smiles")
    print(type(coreSmiles))
    if (len(coreSmiles) == 0):
        return "Please send a non-empty smiles."

    
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
    print("coresmiles ",coreSmiles)        
    smiles = [coreSmiles]
            
            
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
    print("[{:.4f}, {:.4f}, {:.4f}]".format(output[0],output[1],output[2]))
    return "[{:.2f}, {:.2f}, {:.2f}, {:.2f}]".format(output[0],output[1],output[2],output[3])


@app.route("/getMassResult", methods=['POST'])
def getMassResult():
    coreSmiles = request.get_json()
    print(type(coreSmiles))
    splitPattern = r"\\r|\\n|\\r\\n|\\n\\r|\\t"
    coreSmiles = re.split(splitPattern,coreSmiles['body'])
    coreSmiles = [s for s in coreSmiles if s]
    if (len(coreSmiles) == 0):
        return "Please send a non-empty smiles."

    
    with open('./regression_results/configure.json', 'r') as f:
        args = json.load(f)

    if torch.cuda.is_available():
        args['device'] = torch.device('cuda:0')
    else:
        args['device'] = torch.device('cpu')

    args = init_featurizer(args)

    model = load_model(args).to(args['device'])
    checkpoint = torch.load('./regression_results/model.pth', map_location='cpu')
    model.load_state_dict(checkpoint['model_state_dict'])
    model.eval()


    df = pd.DataFrame({'SMILES':coreSmiles[1:-1:]})

    smiles = df[df.columns[0]].tolist()              
            
    dataset = UnlabeledSMILES(smiles, node_featurizer=args['node_featurizer'],
                            edge_featurizer=args['edge_featurizer'],
                            mol_to_graph=partial(mol_to_bigraph, add_self_loop=True))
    
    dataloader = DataLoader(dataset, batch_size=args['batch_size'],
                            collate_fn=collate_molgraphs_unlabeled, num_workers=1)

    predictions = []
    smiles_list = []
    homos = []
    lumos = []
    s1 = []
    s2 = []
            
    with torch.no_grad():
        for batch_id, batch_data in enumerate(tqdm(dataloader, desc="Iteration")):
            batch_smiles, bg = batch_data
            smiles_list.extend(batch_smiles)
            batch_pred = predict(args, model, bg)
            batch_pred = batch_pred.detach().cpu().tolist()
            
            for i in range(len(batch_smiles)):
                predictions.append([])
                predictions[-1].append(batch_smiles[i])
                predictions[-1].extend(batch_pred[i])
                homos.append(batch_pred[i][0])
                lumos.append(batch_pred[i][1])
                s1.append(batch_pred[i][2])
                s2.append(batch_pred[i][3])
                # homos.append(batch_smiles)
                # print(predictions[-1])
            
    # # Select the second column
    # column = df.iloc[:, 4]

    # Plot the histogram
    
    # Switch to the Agg backend
    if (len(homos) == 0 or len(lumos) == 0 or len(s1) == 0 or len(s2) == 0):
        return "Not a valid file"
    else:
        plt.switch_backend('Agg')
        
        fig = plt.figure()
        plt.hist(homos, bins=len(homos)//20,color="#f99f9f",edgecolor="#f54343")
        plt.xlabel('Values',fontsize=15)
        plt.ylabel('Frequency',fontsize=15)
        plt.title('HOMO',fontsize=15)
        plt.xticks(fontsize=15)
        plt.yticks(fontsize=15)

        # Render the plot as an image and encode it as a JPG
        buffer = BytesIO()
        fig.canvas.print_png(buffer)
        image = Image.open(buffer)
        image.save('histogram.png', format='PNG', dpi=(1200,1200))

        # Encode the JPG image as a base64-encoded string
        with open('histogram.png', 'rb') as f:
            encoded_image = base64.b64encode(f.read()).decode('utf-8')

        fig2 = plt.figure()
        plt.hist(lumos, bins=len(lumos)//20,color="#f99f9f",edgecolor="#f54343")
        plt.xlabel('Values',fontsize=15)
        plt.ylabel('Frequency',fontsize=15)
        plt.title('LUMO',fontsize=15)
        plt.xticks(fontsize=15)
        plt.yticks(fontsize=15)

        # Render the plot as an image and encode it as a JPG
        buffer2 = BytesIO()
        fig2.canvas.print_png(buffer2)
        image2 = Image.open(buffer2)
        image2.save('histogram2.png', format='PNG', dpi=(1200,1200))

        # Encode the JPG image as a base64-encoded string
        with open('histogram2.png', 'rb') as f:
            encoded_image2 = base64.b64encode(f.read()).decode('utf-8')

        fig3 = plt.figure()
        plt.hist(s1, bins=len(s1)//20,color="#f99f9f",edgecolor="#f54343")
        plt.xlabel('Values',fontsize=15)
        plt.ylabel('Frequency',fontsize=15)
        plt.title('S1',fontsize=15)
        plt.xticks(fontsize=15)
        plt.yticks(fontsize=15)

        # Render the plot as an image and encode it as a JPG
        buffer3 = BytesIO()
        fig3.canvas.print_png(buffer3)
        image3 = Image.open(buffer3)
        image3.save('histogram3.png', format='PNG', dpi=(1200,1200))
        

        # Encode the JPG image as a base64-encoded string
        with open('histogram3.png', 'rb') as f:
            encoded_image3 = base64.b64encode(f.read()).decode('utf-8')

        fig4 = plt.figure()
        plt.hist(s2, bins=len(s2)//20,color="#f99f9f",edgecolor="#f54343")
        plt.xlabel('Values',fontsize=15)

        plt.ylabel('Frequency',fontsize=15)
        plt.title('S2',fontsize=15)
        plt.xticks(fontsize=15)
        plt.yticks(fontsize=15)

        # Render the plot as an image and encode it as a JPG
        buffer4 = BytesIO()
        fig4.canvas.print_png(buffer4)
        image4 = Image.open(buffer4)
        image4.save('histogram4.png', format='PNG', dpi=(1200,1200))

        # Encode the JPG image as a base64-encoded string
        with open('histogram4.png', 'rb') as f:
            encoded_image4 = base64.b64encode(f.read()).decode('utf-8')
        #predictions = json.dumps(predictions)
        # print(encoded_image)
        return {'predictions': predictions,'homos':encoded_image, 'lumos':encoded_image2,'s1':encoded_image3,'s2':encoded_image4}
        #return predictions

    
@app.route("/auth")
def authenticator():
    #NOTE: the connection here is not secure as the username and password are exposed during the api call request
    # secure the connection
    username = urllib.parse.unquote(request.args.get("username"))
    password = urllib.parse.unquote(request.args.get("password"))
    # password = hashlib.sha256(password).hexdigest()
    print(username, password)
    
    password = password.encode()
    password = hashlib.sha256(password).hexdigest()
    
    conn = sqlite3.connect("userdata.db")
    curr = conn.cursor()
    
    curr.execute("SELECT * FROM userdata WHERE username = ? AND password = ?", (username, password))
    if (curr.fetchall()):
        return "accesspermit"
    else:
        return "accessdenied"
    
    
# if __name__ == "__main__":
#     app.run(host="localhost", port=8000, debug=True)
    
    
if __name__ == '__main__':
    # run app in debug mode on port 5000
    app.run(debug=True, port=12000, host='0.0.0.0')


#changes have been made