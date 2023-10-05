from flask import Flask, request,jsonify, send_file, render_template_string
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
# matplotlib.use('TkAgg')
import matplotlib.pyplot as plt


from argparse import ArgumentParser
import numpy as np
import re

import sqlite3
import hashlib
import urllib.request

import networkx as nx
import matplotlib.pyplot as plt
import matplotlib
# matplotlib.use('TkAgg')
import numpy as np
import matplotlib.rcsetup as rcsetup
import tkinter
matplotlib.get_backend()
from matplotlib import pyplot as plt
import numpy as np
from rdkit import Chem
from rdkit.Chem import Draw,rdMolDescriptors,MolToSmiles
import csv

from csv import writer
import time
import copy
import csv
import os
from csv import writer
import ast

import kora.install.rdkit
from rdkit import Chem
from rdkit.Chem import AllChem
import py3Dmol
from rdkit.Chem import rdMolDescriptors
import io

from structurefunctions import add_atom_index, connect, fuse




app = Flask(__name__)
CORS(app)

# @app.route("/")
# def index():
#     return app.send_static_file('index.html')

#members route
    

@app.route("/getvisuals", methods=['POST'])
def getvisuals():
    data = request.get_json()
    username = data.get('username')
    csv_file = f"./structure_folder/{username}.csv"
    print(csv_file)
    if os.path.exists(csv_file):
        os.remove(csv_file)
        print("deleted ",csv_file)
    

    inputs = data['body']
    edges = []
    for i in range(0,len(inputs),2):
        edges.append((f"{inputs[i]}",f"{inputs[i+1]}"))
    class GraphVisualization:
    
        def __init__(self):
            
            # visual is a list which stores all 
            # the set of edges that constitutes a
            # graph
            self.visual = []
            
        # addEdge function inputs the vertices of an
        # edge and appends it to the visual list
        def addEdge(self, a, b):
            temp = [a, b]
            self.visual.append(temp)
            
        # In visualize function G is an object of
        # class Graph given by networkx G.add_edges_from(visual)
        # creates a graph with a given list
        # nx.draw_networkx(G) - plots the graph
        # plt.show() - displays the graph
        def visualize(self):
            G = nx.Graph()
            G.add_edges_from(self.visual)
            pos = nx.spring_layout(G)
            
            fig, ax = plt.subplots()
            
            nx.draw(G, pos, with_labels=True, node_size=1800, font_size=15, font_color="white", ax=ax,
                    node_color='red', edge_color='black', linewidths=0.5)  # Specify node_color and other parameters
            img_stream = io.BytesIO()
            plt.savefig(img_stream, format='png')
            plt.clf()
            img_stream.seek(0)
            encoded_image = base64.b64encode(img_stream.read()).decode('utf-8')
            return encoded_image
    
  
    # Driver code
    G = GraphVisualization()
    
    for i in range(len(edges)):
        G.addEdge(edges[i][0],edges[i][1])
    imgval = G.visualize()
    # print(imgval)
    return imgval

@app.route("/molcombogenerator", methods=['POST'])
def molcombogeneratir():
    data = request.get_json()
    print(data)
    target = int(data['params']['molmasstot'])
    input_array = ast.literal_eval(data['body']['weightlist'])
    fragweights = ast.literal_eval(data['body']['fragWeights'])
    print("fragweights =", fragweights)
    print("inputarr = ",input_array)
    results = []
    
    weights = []
    for key,value in fragweights.items():
        weights.append(value)
    print("weights = ",weights)
    
    def generate_permutations(arr, index=0, current_permutation=[]):
        # If we have iterated through all subarrays, print the current permutation
        if index == len(arr):
            tempSum = 0
            tempArr = []
            for i in range(len(current_permutation)):
                tempSum += current_permutation[i]
                tempArr.append(weights.index(current_permutation[i]))
            if (tempSum < target):
                # print(current_permutation)
                results.append(tempArr[:])
            return 
        
        # Iterate through the elements in the current subarray
        for element in arr[index]:
            # Add the current element to the current permutation
            current_permutation.append(element)
            
            # Recursively generate permutations for the remaining subarrays
            val = generate_permutations(arr, index + 1, current_permutation)
            
            # Backtrack by removing the last element from the current permutation
            current_permutation.pop()
    generate_permutations(input_array)
    print("results = ",results)
    return results
    

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
    
@app.route("/getImgName")
def getImgName():
    core = request.args.get("smiles")
    print("smile is: ",core)
    mol = Chem.MolFromSmiles(core)
    lenofsmile = mol.GetNumAtoms()
    indexed = add_atom_index(mol)
    molmass = rdMolDescriptors.CalcExactMolWt(mol)
    molmass_rounded = round(molmass, 2)
    if mol is None:
        return "This is not a valid molecule."
    obj = Draw.MolsToGridImage([indexed], molsPerRow=1, subImgSize=(300,300))
    buffer = BytesIO()
    obj.save(buffer, format='PNG')  
    obj2 = Draw.MolsToGridImage([indexed], molsPerRow=7, subImgSize=(500,500))
    buffer2 = BytesIO()
    obj2.save(buffer2, format='PNG')  
    # Encode the image data as a base64 string
    encoded_image = base64.b64encode(buffer.getvalue()).decode('utf-8')
    encoded_image2 = base64.b64encode(buffer2.getvalue()).decode('utf-8')
    return {'coresmile': core, 'lengthofsmile':lenofsmile, 'image': encoded_image,'image2':encoded_image2, 'molmass':molmass_rounded} 
    

@app.route("/producepy3d")
def producepy3d():
    smi = 'c7ccc(c5c(c1ccccc1)c(c2ccccc2)c(c3ccccc3)c(c4ccccc4)c5c6ccccc6)cc7'
    mol = Chem.MolFromSmiles(smi)
    mol = Chem.AddHs(mol)
    AllChem.EmbedMolecule(mol)
    AllChem.MMFFOptimizeMolecule(mol, maxIters=200)
    mblock = Chem.MolToMolBlock(mol)

    view = py3Dmol.view(width=200, height=200)
    view.addModel(mblock, 'mol')
    view.setStyle({'stick': {}})
    view.zoomTo()
    print(view)
    # Convert Py3Dmol view to HTML string
    html = view.to_html()
    
    return jsonify({"html": html})

    
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
    print(coreSmiles)
    
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
    # df.to_csv('filename.csv', index=False)

    smiles = df[df.columns[0]].tolist() 
    print(len(smiles))             
            
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
    homos_corr = []
    lumos_corr = []
            
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
                homos_corr.append((batch_pred[i][0] - 0.9899) / 1.1206)
                lumos_corr.append((batch_pred[i][1] - 2.0041) / 1.385)
                # homos.append(batch_smiles)
                # print(predictions[-1])
    # print(homos)
            
    
    if (len(homos) == 0 or len(lumos) == 0 or len(s1) == 0 or len(s2) == 0):
        return "Not a valid file"
    else:
        plt.switch_backend('Agg')
        
        fig = plt.figure()
        binlen = len(homos)//20
        if (binlen <= 0):
            binlen = 1
        print("binlen = ",binlen)
        plt.hist(homos_corr, bins=binlen, color="#f99f9f",edgecolor="#f54343")
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
        binlen2 = len(lumos)//20
        if (binlen2 <= 0):
            binlen2 = 1
        print(binlen2)
        plt.hist(lumos_corr,bins=binlen2, color="#f99f9f",edgecolor="#f54343")
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
        binlen3 = len(homos)//20
        if (binlen3 <= 0):
            binlen3 = 1
        print(binlen3)
        plt.hist(s1,bins=binlen3,color="#f99f9f",edgecolor="#f54343")
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
        binlen4 = len(homos)//20
        print(binlen4)
        if (binlen4 <= 0):
            binlen4 = 1
        plt.hist(s2, bins=binlen4,color="#f99f9f",edgecolor="#f54343")
        plt.xlabel('Values',fontsize=15)

        plt.ylabel('Frequency',fontsize=15)
        plt.title('SI',fontsize=15)
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
        
@app.route("/getStructureMassResults", methods=['POST'])
def getStructureMassResults():
    coreSmiles = []
    username = request.get_json()["body"]
    file_path = f"./structure_folder/{username}.csv"
    print(file_path)
    try:
        # Open the CSV file
        with open(file_path) as csvfile:
            # Create a CSV reader object
            csv_reader = csv.reader(csvfile)
            
            # Iterate over each row in the CSV file
            for row in csv_reader:
                # Add the row as a separate element to coreSmiles
                coreSmiles.append(row[0])
        
    except FileNotFoundError:
        # Handle the case when the file is not found
        return "CSV file not found"
    
    # print(coreSmiles)
    coreSmiles.append("")
    
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
    # df.to_csv('filename.csv', index=False)

    smiles = df[df.columns[0]].tolist() 
    print(len(smiles))             
            
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
    homos_corr = []
    lumos_corr = []
            
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
                homos_corr.append((batch_pred[i][0] - 0.9899) / 1.1206)
                lumos_corr.append((batch_pred[i][1] - 2.0041) / 1.385)
                # homos.append(batch_smiles)
                # print(predictions[-1])
    # print(homos)
            
    
    if (len(homos) == 0 or len(lumos) == 0 or len(s1) == 0 or len(s2) == 0):
        return "Not a valid file"
    else:
        plt.switch_backend('Agg')
        
        fig = plt.figure()
        binlen = len(homos)//20
        if (binlen <= 0):
            binlen = 1
        print("binlen = ",binlen)
        plt.hist(homos_corr,bins=binlen, color="#f99f9f",edgecolor="#f54343")
        plt.xlabel('Values',fontsize=15)
        plt.ylabel('Frequency',fontsize=15)
        plt.title('Corr. H',fontsize=15)
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
        binlen2 = len(lumos)//20
        if (binlen2 <= 0):
            binlen2 = 1
        print(binlen2)
        plt.hist(lumos_corr,bins=binlen2,color="#f99f9f",edgecolor="#f54343")
        plt.xlabel('Values',fontsize=15)
        plt.ylabel('Frequency',fontsize=15)
        plt.title('Corr. L',fontsize=15)
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
        binlen3 = len(homos)//20
        if (binlen3 <= 0):
            binlen3 = 1
        print(binlen3)
        plt.hist(s1,bins=binlen3,color="#f99f9f",edgecolor="#f54343")
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
        binlen4 = len(homos)//20
        print(binlen4)
        if (binlen4 <= 0):
            binlen4 = 1
        plt.hist(s2,bins=binlen4,color="#f99f9f",edgecolor="#f54343")
        plt.xlabel('Values',fontsize=15)

        plt.ylabel('Frequency',fontsize=15)
        plt.title('SI',fontsize=15)
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
    
 
def callProcessor(data):
    smiles = {}
    vertices = []
    edges = []
    objectSummary = {}

    data_keys = list(data.keys())

    if (len(data) == 7):   
        keys0 = list(data[data_keys[0]])
        keys1 = list(data[data_keys[1]])
        keys2 = list(data[data_keys[2]])
        keys3 = list(data[data_keys[3]])
        keys4 = list(data[data_keys[4]])
        keys5 = list(data[data_keys[5]])
        keys6 = list(data[data_keys[6]])

        objectSummary['a0'] = []
        objectSummary['a1'] = []
        objectSummary['a2'] = []
        objectSummary['a3'] = []
        objectSummary['a4'] = []
        objectSummary['a5'] = []
        objectSummary['a6'] = []

        vertices.append('a0')
        vertices.append('a1')
        vertices.append('a2')
        vertices.append('a3')
        vertices.append('a4')
        vertices.append('a5')
        vertices.append('a6')

        smiles['a0'] = data['0div']['altval']
        smiles['a1'] = data['1div']['altval']
        smiles['a2'] = data['2div']['altval']
        smiles['a3'] = data['3div']['altval']
        smiles['a4'] = data['4div']['altval']
        smiles['a5'] = data['5div']['altval']
        smiles['a6'] = data['6div']['altval']

        for i in range(len(keys0)):
            if i != 0:
                divnum = keys0[i][1::]+"div"
                v1 = [ast.literal_eval(data['0div'][keys0[i]][1]),ast.literal_eval(data[divnum]['a0'][1]),keys0[i],data['0div'][keys0[i]][0]]
                v2 = [ast.literal_eval(data[divnum]['a0'][1]),ast.literal_eval(data['0div'][keys0[i]][1]),'a0',data['0div'][keys0[i]][0]]
                if (v1 not in objectSummary['a0']):
                    objectSummary['a0'].append(v1)
                    edges.append(('a0',keys0[i]))
                if (v2 not in objectSummary[keys0[i]]):
                    objectSummary[keys0[i]].append(v2)
        for j in range(len(keys1)):
            if j != 0:
                divnum = keys1[j][1::]+"div"
                v3 = [ast.literal_eval(data['1div'][keys1[j]][1]),ast.literal_eval(data[divnum]['a1'][1]),keys1[j],data['1div'][keys1[j]][0]]
                v4 = [ast.literal_eval(data[divnum]['a1'][1]),ast.literal_eval(data['1div'][keys1[j]][1]),'a1',data['1div'][keys1[j]][0]]
                if (v3 not in objectSummary['a1']):
                    objectSummary['a1'].append(v3)
                    edges.append(('a1',keys1[j]))
                if (v4 not in objectSummary[keys1[j]]):
                    objectSummary[keys1[j]].append(v4)

        for k in range(len(keys2)):
            if k != 0:
                divnum = keys2[k][1::]+"div"
                v5 = [ast.literal_eval(data['2div'][keys2[k]][1]),ast.literal_eval(data[divnum]['a2'][1]),keys2[k],data['2div'][keys2[k]][0]]
                v6 = [ast.literal_eval(data[divnum]['a2'][1]),ast.literal_eval(data['2div'][keys2[k]][1]),'a2',data['2div'][keys2[k]][0]]
                if (v5 not in objectSummary['a2']):
                    objectSummary['a2'].append(v5)
                    edges.append(('a2',keys2[k]))
                if (v6 not in objectSummary[keys2[k]]): 
                    objectSummary[keys2[k]].append(v6)

        for l in range(len(keys3)):
            if l != 0:
                divnum = keys3[l][1::]+"div"
                v7 = [ast.literal_eval(data['3div'][keys3[l]][1]),ast.literal_eval(data[divnum]['a3'][1]),keys3[l],data['3div'][keys3[l]][0]]
                v8 = [ast.literal_eval(data[divnum]['a3'][1]),ast.literal_eval(data['3div'][keys3[l]][1]),'a3',data['3div'][keys3[l]][0]]
                if (v7 not in objectSummary['a3']):
                    objectSummary['a3'].append(v7)
                    edges.append(('a3',keys3[l]))
                if (v8 not in objectSummary[keys3[l]]):
                    objectSummary[keys3[l]].append(v8)
                    
        for m in range(len(keys4)):
            if m != 0:
                divnum = keys4[m][1::]+"div"
                v9 = [ast.literal_eval(data['4div'][keys4[m]][1]),ast.literal_eval(data[divnum]['a4'][1]),keys4[m],data['4div'][keys4[m]][0]]
                v10 = [ast.literal_eval(data[divnum]['a4'][1]),ast.literal_eval(data['4div'][keys4[m]][1]),'a4',data['4div'][keys4[m]][0]]
                if (v9 not in objectSummary['a4']):
                    objectSummary['a4'].append(v9)
                    edges.append(('a4',keys4[m]))
                if (v10 not in objectSummary[keys4[m]]):
                    objectSummary[keys4[m]].append(v10)
        for n in range(len(keys5)):
            if n != 0:
                divnum = keys5[n][1::]+"div"
                v11 = [ast.literal_eval(data['5div'][keys5[n]][1]),ast.literal_eval(data[divnum]['a5'][1]),keys5[n],data['5div'][keys5[n]][0]]
                v12 = [ast.literal_eval(data[divnum]['a5'][1]),ast.literal_eval(data['5div'][keys5[n]][1]),'a5',data['5div'][keys5[n]][0]]
                if (v11 not in objectSummary['a5']):
                    objectSummary['a5'].append(v11)
                    edges.append(('a5',keys5[n]))
                if (v12 not in objectSummary[keys5[n]]):
                    objectSummary[keys5[n]].append(v12)
        for o in range(len(keys6)):
            if o != 0:
                divnum = keys6[o][1::]+"div"
                v13 = [ast.literal_eval(data['6div'][keys6[o]][1]),ast.literal_eval(data[divnum]['a6'][1]),keys6[o],data['6div'][keys6[o]][0]]
                v14 = [ast.literal_eval(data[divnum]['a6'][1]),ast.literal_eval(data['6div'][keys6[o]][1]),'a6',data['6div'][keys6[o]][0]]
                if (v13 not in objectSummary['a6']):
                    objectSummary['a6'].append(v13)
                    edges.append(('a6',keys6[o]))
                if (v14 not in objectSummary[keys6[o]]):
                    objectSummary[keys6[o]].append(v14)
        
        # print("object summary for 6 = " , objectSummary)
    
    elif (len(data) == 6):   
        keys0 = list(data[data_keys[0]])
        keys1 = list(data[data_keys[1]])
        keys2 = list(data[data_keys[2]])
        keys3 = list(data[data_keys[3]])
        keys4 = list(data[data_keys[4]])
        keys5 = list(data[data_keys[5]])

        objectSummary['a0'] = []
        objectSummary['a1'] = []
        objectSummary['a2'] = []
        objectSummary['a3'] = []
        objectSummary['a4'] = []
        objectSummary['a5'] = []

        vertices.append('a0')
        vertices.append('a1')
        vertices.append('a2')
        vertices.append('a3')
        vertices.append('a4')
        vertices.append('a5')

        smiles['a0'] = data['0div']['altval']
        smiles['a1'] = data['1div']['altval']
        smiles['a2'] = data['2div']['altval']
        smiles['a3'] = data['3div']['altval']
        smiles['a4'] = data['4div']['altval']
        smiles['a5'] = data['5div']['altval']

        for i in range(len(keys0)):
            if i != 0:
                divnum = keys0[i][1::]+"div"
                v1 = [ast.literal_eval(data['0div'][keys0[i]][1]),ast.literal_eval(data[divnum]['a0'][1]),keys0[i],data['0div'][keys0[i]][0]]
                v2 = [ast.literal_eval(data[divnum]['a0'][1]),ast.literal_eval(data['0div'][keys0[i]][1]),'a0',data['0div'][keys0[i]][0]]
                if (v1 not in objectSummary['a0']):
                    objectSummary['a0'].append(v1)
                    edges.append(('a0',keys0[i]))
                if (v2 not in objectSummary[keys0[i]]):
                    objectSummary[keys0[i]].append(v2)
        for j in range(len(keys1)):
            if j != 0:
                divnum = keys1[j][1::]+"div"
                v3 = [ast.literal_eval(data['1div'][keys1[j]][1]),ast.literal_eval(data[divnum]['a1'][1]),keys1[j],data['1div'][keys1[j]][0]]
                v4 = [ast.literal_eval(data[divnum]['a1'][1]),ast.literal_eval(data['1div'][keys1[j]][1]),'a1',data['1div'][keys1[j]][0]]
                if (v3 not in objectSummary['a1']):
                    objectSummary['a1'].append(v3)
                    edges.append(('a1',keys1[j]))
                if (v4 not in objectSummary[keys1[j]]):
                    objectSummary[keys1[j]].append(v4)

        for k in range(len(keys2)):
            if k != 0:
                divnum = keys2[k][1::]+"div"
                v5 = [ast.literal_eval(data['2div'][keys2[k]][1]),ast.literal_eval(data[divnum]['a2'][1]),keys2[k],data['2div'][keys2[k]][0]]
                v6 = [ast.literal_eval(data[divnum]['a2'][1]),ast.literal_eval(data['2div'][keys2[k]][1]),'a2',data['2div'][keys2[k]][0]]
                if (v5 not in objectSummary['a2']):
                    objectSummary['a2'].append(v5)
                    edges.append(('a2',keys2[k]))
                if (v6 not in objectSummary[keys2[k]]): 
                    objectSummary[keys2[k]].append(v6)

        for l in range(len(keys3)):
            if l != 0:
                divnum = keys3[l][1::]+"div"
                v7 = [ast.literal_eval(data['3div'][keys3[l]][1]),ast.literal_eval(data[divnum]['a3'][1]),keys3[l],data['3div'][keys3[l]][0]]
                v8 = [ast.literal_eval(data[divnum]['a3'][1]),ast.literal_eval(data['3div'][keys3[l]][1]),'a3',data['3div'][keys3[l]][0]]
                if (v7 not in objectSummary['a3']):
                    objectSummary['a3'].append(v7)
                    edges.append(('a3',keys3[l]))
                if (v8 not in objectSummary[keys3[l]]):
                    objectSummary[keys3[l]].append(v8)
                    
        for m in range(len(keys4)):
            if m != 0:
                divnum = keys4[m][1::]+"div"
                v9 = [ast.literal_eval(data['4div'][keys4[m]][1]),ast.literal_eval(data[divnum]['a4'][1]),keys4[m],data['4div'][keys4[m]][0]]
                v10 = [ast.literal_eval(data[divnum]['a4'][1]),ast.literal_eval(data['4div'][keys4[m]][1]),'a4',data['4div'][keys4[m]][0]]
                if (v9 not in objectSummary['a4']):
                    objectSummary['a4'].append(v9)
                    edges.append(('a4',keys4[m]))
                if (v10 not in objectSummary[keys4[m]]):
                    objectSummary[keys4[m]].append(v10)
        for n in range(len(keys5)):
            if n != 0:
                divnum = keys5[n][1::]+"div"
                v11 = [ast.literal_eval(data['5div'][keys5[n]][1]),ast.literal_eval(data[divnum]['a5'][1]),keys5[n],data['5div'][keys5[n]][0]]
                v12 = [ast.literal_eval(data[divnum]['a5'][1]),ast.literal_eval(data['5div'][keys5[n]][1]),'a5',data['5div'][keys5[n]][0]]
                if (v11 not in objectSummary['a5']):
                    objectSummary['a5'].append(v11)
                    edges.append(('a5',keys5[n]))
                if (v12 not in objectSummary[keys5[n]]):
                    objectSummary[keys5[n]].append(v12)
        
        # print("object summary for 6 = " , objectSummary)
    
    elif (len(data) == 5):   
        keys0 = list(data[data_keys[0]])
        keys1 = list(data[data_keys[1]])
        keys2 = list(data[data_keys[2]])
        keys3 = list(data[data_keys[3]])
        keys4 = list(data[data_keys[4]])

        objectSummary['a0'] = []
        objectSummary['a1'] = []
        objectSummary['a2'] = []
        objectSummary['a3'] = []
        objectSummary['a4'] = []

        vertices.append('a0')
        vertices.append('a1')
        vertices.append('a2')
        vertices.append('a3')
        vertices.append('a4')

        smiles['a0'] = data['0div']['altval']
        smiles['a1'] = data['1div']['altval']
        smiles['a2'] = data['2div']['altval']
        smiles['a3'] = data['3div']['altval']
        smiles['a4'] = data['4div']['altval']

        for i in range(len(keys0)):
            if i != 0:
                divnum = keys0[i][1::]+"div"
                v1 = [ast.literal_eval(data['0div'][keys0[i]][1]),ast.literal_eval(data[divnum]['a0'][1]),keys0[i],data['0div'][keys0[i]][0]]
                v2 = [ast.literal_eval(data[divnum]['a0'][1]),ast.literal_eval(data['0div'][keys0[i]][1]),'a0',data['0div'][keys0[i]][0]]
                if (v1 not in objectSummary['a0']):
                    objectSummary['a0'].append(v1)
                    edges.append(('a0',keys0[i]))
                if (v2 not in objectSummary[keys0[i]]):
                    objectSummary[keys0[i]].append(v2)
        for j in range(len(keys1)):
            if j != 0:
                divnum = keys1[j][1::]+"div"
                v3 = [ast.literal_eval(data['1div'][keys1[j]][1]),ast.literal_eval(data[divnum]['a1'][1]),keys1[j],data['1div'][keys1[j]][0]]
                v4 = [ast.literal_eval(data[divnum]['a1'][1]),ast.literal_eval(data['1div'][keys1[j]][1]),'a1',data['1div'][keys1[j]][0]]
                if (v3 not in objectSummary['a1']):
                    objectSummary['a1'].append(v3)
                    edges.append(('a1',keys1[j]))
                if (v4 not in objectSummary[keys1[j]]):
                    objectSummary[keys1[j]].append(v4)

        for k in range(len(keys2)):
            if k != 0:
                divnum = keys2[k][1::]+"div"
                v5 = [ast.literal_eval(data['2div'][keys2[k]][1]),ast.literal_eval(data[divnum]['a2'][1]),keys2[k],data['2div'][keys2[k]][0]]
                v6 = [ast.literal_eval(data[divnum]['a2'][1]),ast.literal_eval(data['2div'][keys2[k]][1]),'a2',data['2div'][keys2[k]][0]]
                if (v5 not in objectSummary['a2']):
                    objectSummary['a2'].append(v5)
                    edges.append(('a2',keys2[k]))
                if (v6 not in objectSummary[keys2[k]]): 
                    objectSummary[keys2[k]].append(v6)

        for l in range(len(keys3)):
            if l != 0:
                divnum = keys3[l][1::]+"div"
                v7 = [ast.literal_eval(data['3div'][keys3[l]][1]),ast.literal_eval(data[divnum]['a3'][1]),keys3[l],data['3div'][keys3[l]][0]]
                v8 = [ast.literal_eval(data[divnum]['a3'][1]),ast.literal_eval(data['3div'][keys3[l]][1]),'a3',data['3div'][keys3[l]][0]]
                if (v7 not in objectSummary['a3']):
                    objectSummary['a3'].append(v7)
                    edges.append(('a3',keys3[l]))
                if (v8 not in objectSummary[keys3[l]]):
                    objectSummary[keys3[l]].append(v8)
                    
        for m in range(len(keys4)):
            if m != 0:
                divnum = keys4[m][1::]+"div"
                v9 = [ast.literal_eval(data['4div'][keys4[m]][1]),ast.literal_eval(data[divnum]['a4'][1]),keys4[m],data['4div'][keys4[m]][0]]
                v10 = [ast.literal_eval(data[divnum]['a4'][1]),ast.literal_eval(data['4div'][keys4[m]][1]),'a4',data['4div'][keys4[m]][0]]
                if (v9 not in objectSummary['a4']):
                    objectSummary['a4'].append(v9)
                    edges.append(('a4',keys4[m]))
                if (v10 not in objectSummary[keys4[m]]):
                    objectSummary[keys4[m]].append(v10)
        
        # print("object summary for 5 = " , objectSummary)

    elif (len(data) == 4):   
        keys0 = list(data[data_keys[0]])
        keys1 = list(data[data_keys[1]])
        keys2 = list(data[data_keys[2]])
        keys3 = list(data[data_keys[3]])

        objectSummary['a0'] = []
        objectSummary['a1'] = []
        objectSummary['a2'] = []
        objectSummary['a3'] = []

        vertices.append('a0')
        vertices.append('a1')
        vertices.append('a2')
        vertices.append('a3')

        smiles['a0'] = data['0div']['altval']
        smiles['a1'] = data['1div']['altval']
        smiles['a2'] = data['2div']['altval']
        smiles['a3'] = data['3div']['altval']

        for i in range(len(keys0)):
            if i != 0:
                divnum = keys0[i][1::]+"div"
                v1 = [ast.literal_eval(data['0div'][keys0[i]][1]),ast.literal_eval(data[divnum]['a0'][1]),keys0[i],data['0div'][keys0[i]][0]]
                v2 = [ast.literal_eval(data[divnum]['a0'][1]),ast.literal_eval(data['0div'][keys0[i]][1]),'a0',data['0div'][keys0[i]][0]]
                if (v1 not in objectSummary['a0']):
                    objectSummary['a0'].append(v1)
                    edges.append(('a0',keys0[i]))
                if (v2 not in objectSummary[keys0[i]]):
                    objectSummary[keys0[i]].append(v2)
        for j in range(len(keys1)):
            if j != 0:
                divnum = keys1[j][1::]+"div"
                v3 = [ast.literal_eval(data['1div'][keys1[j]][1]),ast.literal_eval(data[divnum]['a1'][1]),keys1[j],data['1div'][keys1[j]][0]]
                v4 = [ast.literal_eval(data[divnum]['a1'][1]),ast.literal_eval(data['1div'][keys1[j]][1]),'a1',data['1div'][keys1[j]][0]]
                if (v3 not in objectSummary['a1']):
                    objectSummary['a1'].append(v3)
                    edges.append(('a1',keys1[j]))
                if (v4 not in objectSummary[keys1[j]]):
                    objectSummary[keys1[j]].append(v4)

        for k in range(len(keys2)):
            if k != 0:
                divnum = keys2[k][1::]+"div"
                v5 = [ast.literal_eval(data['2div'][keys2[k]][1]),ast.literal_eval(data[divnum]['a2'][1]),keys2[k],data['2div'][keys2[k]][0]]
                v6 = [ast.literal_eval(data[divnum]['a2'][1]),ast.literal_eval(data['2div'][keys2[k]][1]),'a2',data['2div'][keys2[k]][0]]
                if (v5 not in objectSummary['a2']):
                    objectSummary['a2'].append(v5)
                    edges.append(('a2',keys2[k]))
                if (v6 not in objectSummary[keys2[k]]): 
                    objectSummary[keys2[k]].append(v6)
                    
        for l in range(len(keys3)):
            if l != 0:
                divnum = keys3[l][1::]+"div"
                v7 = [ast.literal_eval(data['3div'][keys3[l]][1]),ast.literal_eval(data[divnum]['a3'][1]),keys3[l],data['3div'][keys3[l]][0]]
                v8 = [ast.literal_eval(data[divnum]['a3'][1]),ast.literal_eval(data['3div'][keys3[l]][1]),'a3',data['3div'][keys3[l]][0]]
                if (v7 not in objectSummary['a3']):
                    objectSummary['a3'].append(v7)
                    edges.append(('a3',keys3[l]))
                if (v8 not in objectSummary[keys3[l]]):
                    objectSummary[keys3[l]].append(v8)
                    
        # print("object summary for 4 = " , objectSummary)

    elif (len(data) == 3):   
        keys0 = list(data[data_keys[0]])
        keys1 = list(data[data_keys[1]])
        keys2 = list(data[data_keys[2]])

        objectSummary['a0'] = []
        objectSummary['a1'] = []
        objectSummary['a2'] = []

        vertices.append('a0')
        vertices.append('a1')
        vertices.append('a2')

        smiles['a0'] = data['0div']['altval']
        smiles['a1'] = data['1div']['altval']
        smiles['a2'] = data['2div']['altval']

        for i in range(len(keys0)):
            if i != 0:
                divnum = keys0[i][1::]+"div"
                v1 = [ast.literal_eval(data['0div'][keys0[i]][1]),ast.literal_eval(data[divnum]['a0'][1]),keys0[i],data['0div'][keys0[i]][0]]
                v2 = [ast.literal_eval(data[divnum]['a0'][1]),ast.literal_eval(data['0div'][keys0[i]][1]),'a0',data['0div'][keys0[i]][0]]
                if (v1 not in objectSummary['a0']):
                    objectSummary['a0'].append(v1)
                    edges.append(('a0',keys0[i]))
                if (v2 not in objectSummary[keys0[i]]):
                    objectSummary[keys0[i]].append(v2)
        for j in range(len(keys1)):
            if j != 0:
                divnum = keys1[j][1::]+"div"
                v3 = [ast.literal_eval(data['1div'][keys1[j]][1]),ast.literal_eval(data[divnum]['a1'][1]),keys1[j],data['1div'][keys1[j]][0]]
                v4 = [ast.literal_eval(data[divnum]['a1'][1]),ast.literal_eval(data['1div'][keys1[j]][1]),'a1',data['1div'][keys1[j]][0]]
                if (v3 not in objectSummary['a1']):
                    objectSummary['a1'].append(v3)
                    edges.append(('a1',keys1[j]))
                if (v4 not in objectSummary[keys1[j]]):
                    objectSummary[keys1[j]].append(v4)
        
        for k in range(len(keys2)):
            if k != 0:
                divnum = keys2[k][1::]+"div"
                v5 = [ast.literal_eval(data['2div'][keys2[k]][1]),ast.literal_eval(data[divnum]['a2'][1]),keys2[k],data['2div'][keys2[k]][0]]
                v6 = [ast.literal_eval(data[divnum]['a2'][1]),ast.literal_eval(data['2div'][keys2[k]][1]),'a2',data['2div'][keys2[k]][0]]
                if (v5 not in objectSummary['a2']):
                    objectSummary['a2'].append(v5)
                    edges.append(('a2',keys2[k]))
                if (v6 not in objectSummary[keys2[k]]): 
                    objectSummary[keys2[k]].append(v6)
                    
                    
        # print("object summary for 3 = " , objectSummary)

    elif (len(data) == 2):   
        keys0 = list(data[data_keys[0]])
        keys1 = list(data[data_keys[1]])

        objectSummary['a0'] = []
        objectSummary['a1'] = []

        vertices.append('a0')
        vertices.append('a1')

        smiles['a0'] = data['0div']['altval']
        smiles['a1'] = data['1div']['altval']

        for i in range(len(keys0)):
            if i != 0:
                divnum = keys0[i][1::]+"div"
                v1 = [ast.literal_eval(data['0div'][keys0[i]][1]),ast.literal_eval(data[divnum]['a0'][1]),keys0[i],data['0div'][keys0[i]][0]]
                v2 = [ast.literal_eval(data[divnum]['a0'][1]),ast.literal_eval(data['0div'][keys0[i]][1]),'a0',data['0div'][keys0[i]][0]]
                if (v1 not in objectSummary['a0']):
                    objectSummary['a0'].append(v1)
                    edges.append(('a0',keys0[i]))
                if (v2 not in objectSummary[keys0[i]]):
                    objectSummary[keys0[i]].append(v2)

        for j in range(len(keys1)):
            if j != 0:
                divnum = keys1[j][1::]+"div"
                v3 = [ast.literal_eval(data['1div'][keys1[j]][1]),ast.literal_eval(data[divnum]['a1'][1]),keys1[j],data['1div'][keys1[j]][0]]
                v4 = [ast.literal_eval(data[divnum]['a1'][1]),ast.literal_eval(data['1div'][keys1[j]][1]),'a1',data['1div'][keys1[j]][0]]
                if (v3 not in objectSummary['a1']):
                    objectSummary['a1'].append(v3)
                    edges.append(('a1',keys1[j]))
                if (v4 not in objectSummary[keys1[j]]):
                    objectSummary[keys1[j]].append(v4)
                    
        # print("object summary for 2 = " , objectSummary)
        

    graph = {}
    addedCores = []

    # Add the vertices to the graph
    for vertex in vertices:
        graph[vertex] = []

    # Add the edges to the graph
    for edge in edges:
        u, v = edge
        graph[u].append(v)
        graph[v].append(u)


    def processVertex(vertex,core,coreEmpty):

        if (coreEmpty == True):
            core = Chem.MolFromSmiles(smiles[vertex])
            addedCores.append(vertex)
            coreEmpty = False

        toIterate = objectSummary[vertex]    
        while (len(toIterate) > 0):
            if (toIterate[0][3] == 'fuse'):
                atoms = (core).GetNumAtoms() #number of atoms currently in core

                core = fuse(core, Chem.MolFromSmiles(smiles[toIterate[0][2]]),toIterate[0][0],toIterate[0][1])

                addedCores.append(toIterate[0][2])

                modifyChild = toIterate[0][2]
                bondFusedTo = toIterate[0][1]
                removalChild = toIterate[0]
                toIterate.remove(removalChild)

                for i in range(len(objectSummary[modifyChild])):
                    # print(type(objectSummary[modifyChild][i][0]))
                    if (isinstance(objectSummary[modifyChild][i][0],int) == True):
                        if (objectSummary[modifyChild][i][0] < bondFusedTo[0]):
                            objectSummary[modifyChild][i][0] += (atoms)
                        elif (objectSummary[modifyChild][i][0] > bondFusedTo[1]):
                            objectSummary[modifyChild][i][0] += (atoms-2)
                    else:
                        if (objectSummary[modifyChild][i][0][0] < bondFusedTo[0]):
                            objectSummary[modifyChild][i][0][0] += (atoms)
                            objectSummary[modifyChild][i][0][1] += (atoms)
                        elif (objectSummary[modifyChild][i][0][1] > bondFusedTo[1]):
                            objectSummary[modifyChild][i][0][0] += (atoms-2)
                            objectSummary[modifyChild][i][0][1] += (atoms-2)
                iterator = len(objectSummary[modifyChild])
                idx = 0
                while (idx < iterator):
                        if (objectSummary[modifyChild][0][2] in addedCores):
                            objectSummary[modifyChild].remove(objectSummary[modifyChild][0])
                        idx += 1

            elif (toIterate[0][3] == 'connect'):
                atoms = (core).GetNumAtoms() #number of atoms currently in core

                core = connect(core, Chem.MolFromSmiles(smiles[toIterate[0][2]]),[toIterate[0][0],toIterate[0][1]])

                addedCores.append(toIterate[0][2])

                modifyChild = toIterate[0][2]
                removalChild = toIterate[0]
                toIterate.remove(removalChild)

                for i in range(len(objectSummary[modifyChild])):
                    if (isinstance(objectSummary[modifyChild][i][0],int) == True):
                        objectSummary[modifyChild][i][0] += atoms
                    else:
                        objectSummary[modifyChild][i][0][0] += atoms
                        objectSummary[modifyChild][i][0][1] += atoms

                iterator = len(objectSummary[modifyChild])
                idx = 0
                while (idx < iterator):
                        if (objectSummary[modifyChild][0][2] in addedCores):
                            objectSummary[modifyChild].remove(objectSummary[modifyChild][0])
                        idx += 1

        return core , coreEmpty

    # Define the BFS function
    def bfs(graph, start, core, coreEmpty, smiles):
        # Create a queue for BFS
        queue = [start]

        # Mark the start node as visited
        visited = {start}

        # Loop until the queue is empty
        while queue:
            # Dequeue a vertex from the queue
            vertex = queue.pop(0)

            # core should be modified here
            core , coreEmpty = processVertex(vertex, core, coreEmpty)

            # Enqueue all adjacent nodes that have not been visited
            for neighbor in graph[vertex]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        return core

    core = ''
    coreEmpty = True

    # Call the BFS function with starting vertex 'A'
    core = bfs(graph, vertices[0], core, coreEmpty, smiles)
    # print(Chem.MolToSmiles(core))
    return Chem.MolToSmiles(core)
    

# def callProcessor(data):
    smiles = {}
    vertices = []
    edges = []
    objectSummary = {}

    data_keys = list(data.keys())

    for index, (key, value) in enumerate(data.items()):
        smileListLen = len(smiles)
        smiles[f'a{smileListLen}'] = value['altval']
        objectSummary[f'a{smileListLen}'] = []
        vertices.append(f'a{smileListLen}')
        edges.append((f'a{smileListLen}', f'a{smileListLen + 1}'))
        if value.get('prev') is None and value['next'] is not None:
            next_key = data_keys[index + 1]  # Get the key of the next dictionary entry
            tempArr = [eval(value['next'][1]), eval(data[next_key]['prev'][1]), f'a{smileListLen+1}', value['next'][0]]
            objectSummary[f'a{smileListLen}'].append(tempArr)
        elif value['prev'] is not None and len(value['next']) != 0 and value['next'] is not None:
            prev_key = data_keys[index - 1]  # Get the key of the previous dictionary entry
            next_key = data_keys[index + 1]  # Get the key of the next dictionary entry
            tempArr1 = [eval(value['prev'][1]), eval(data[prev_key]['next'][1]), f'a{smileListLen-1}', value['prev'][0]]
            tempArr2 = [eval(value['next'][1]), eval(data[next_key]['prev'][1]), f'a{smileListLen+1}', value['next'][0]]
            objectSummary[f'a{smileListLen}'].append(tempArr1)
            objectSummary[f'a{smileListLen}'].append(tempArr2)
        elif value['prev'] is not None and len(value['next']) == 0:
            prev_key = data_keys[index - 1]
            tempArr1 = [eval(value['prev'][1]), eval(data[prev_key]['next'][1]), f'a{smileListLen-1}', value['prev'][0]]
            objectSummary[f'a{smileListLen}'].append(tempArr1)
    edges.pop()

    graph = {}
    addedCores = []

    # Add the vertices to the graph
    for vertex in vertices:
        graph[vertex] = []

    # Add the edges to the graph
    for edge in edges:
        u, v = edge
        graph[u].append(v)
        graph[v].append(u)


    def processVertex(vertex,core,coreEmpty):

        if (coreEmpty == True):
            core = Chem.MolFromSmiles(smiles[vertex])
            addedCores.append(vertex)
            coreEmpty = False

        toIterate = objectSummary[vertex]    
        while (len(toIterate) > 0):
            if (toIterate[0][3] == 'fuse'):
                atoms = (core).GetNumAtoms() #number of atoms currently in core

                core = fuse(core, Chem.MolFromSmiles(smiles[toIterate[0][2]]),toIterate[0][0],toIterate[0][1])

                addedCores.append(toIterate[0][2])

                modifyChild = toIterate[0][2]
                bondFusedTo = toIterate[0][1]
                removalChild = toIterate[0]
                toIterate.remove(removalChild)

                for i in range(len(objectSummary[modifyChild])):

                    if (isinstance(objectSummary[modifyChild][i][0],int) == True):
                        if (objectSummary[modifyChild][i][0] < bondFusedTo[0]):
                            objectSummary[modifyChild][i][0] += (atoms)
                        elif (objectSummary[modifyChild][i][0] > bondFusedTo[1]):
                            objectSummary[modifyChild][i][0] += (atoms-2)
                    else:
                        if (objectSummary[modifyChild][i][0][0] < bondFusedTo[0]):
                            objectSummary[modifyChild][i][0][0] += (atoms)
                            objectSummary[modifyChild][i][0][1] += (atoms)
                        elif (objectSummary[modifyChild][i][0][1] > bondFusedTo[1]):
                            objectSummary[modifyChild][i][0][0] += (atoms-2)
                            objectSummary[modifyChild][i][0][1] += (atoms-2)
                iterator = len(objectSummary[modifyChild])
                idx = 0
                while (idx < iterator):
                        if (objectSummary[modifyChild][0][2] in addedCores):
                            objectSummary[modifyChild].remove(objectSummary[modifyChild][0])
                        idx += 1

            elif (toIterate[0][3] == 'connect'):
                atoms = (core).GetNumAtoms() #number of atoms currently in core

                core = connect(core, Chem.MolFromSmiles(smiles[toIterate[0][2]]),[toIterate[0][0],toIterate[0][1]])

                addedCores.append(toIterate[0][2])

                modifyChild = toIterate[0][2]
                removalChild = toIterate[0]
                toIterate.remove(removalChild)

                for i in range(len(objectSummary[modifyChild])):
                    if (isinstance(objectSummary[modifyChild][i][0],int) == True):
                        objectSummary[modifyChild][i][0] += atoms
                    else:
                        objectSummary[modifyChild][i][0][0] += atoms
                        objectSummary[modifyChild][i][0][1] += atoms

                iterator = len(objectSummary[modifyChild])
                idx = 0
                while (idx < iterator):
                        if (objectSummary[modifyChild][0][2] in addedCores):
                            objectSummary[modifyChild].remove(objectSummary[modifyChild][0])
                        idx += 1

        return core , coreEmpty

    # Define the BFS function
    def bfs(graph, start, core, coreEmpty, smiles):
        # Create a queue for BFS
        queue = [start]

        # Mark the start node as visited
        visited = {start}

        # Loop until the queue is empty
        while queue:
            # Dequeue a vertex from the queue
            vertex = queue.pop(0)

            # core should be modified here
            core , coreEmpty = processVertex(vertex, core, coreEmpty)

            # Enqueue all adjacent nodes that have not been visited
            for neighbor in graph[vertex]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        return core

    core = ''
    coreEmpty = True

    # Call the BFS function with starting vertex 'A'
    core = bfs(graph, vertices[0], core, coreEmpty, smiles)

    return Chem.MolToSmiles(core)

@app.route("/preparecombos", methods=['POST'])
def preparecombos():
    mainsource = request.json.get('body')
    username = request.args.get("username")
    count = 0

    print(mainsource)
    # data = []
    indices = []

    csv_file = f"./structure_folder/{username}.csv"
    
    if os.path.exists(csv_file):
        os.remove(csv_file)
        print("deleted ",csv_file)
        
    with open(csv_file,'a') as data_file:
        writer_obj = writer(data_file)
        writer_obj.writerow(['SMILES'])
        keysmain = list(mainsource.keys())

        doppleganger = {}

        for keys in range(len(keysmain)):
            doppleganger[keysmain[keys]] = {
                'altval': mainsource[keysmain[keys]]['altval']
            } 


        divs = []
        a = []

        if (len(mainsource) == 2):
            print("for the 2")
            keys0 = list(mainsource[keysmain[0]])
            keys1 = list(mainsource[keysmain[1]])

            for x0 in range(1,len(keys0)):
                divs.append("0div")
                a.append(keys0[x0])
                doppleganger['0div'][keys0[x0]] = [mainsource['0div'][keys0[x0]][0]]
            for x1 in range(1,len(keys1)):
                divs.append("1div")
                a.append(keys1[x1])
                doppleganger['1div'][keys1[x1]] = [mainsource['1div'][keys1[x1]][0]]

            copied_doppleganger = copy.deepcopy(doppleganger)


            print("doppleganger = ",doppleganger)
            print("divs = ",divs)
            print("a = ",a)
            print()
            for i in range(1,len(mainsource[divs[0]][a[0]])):
                for j in range(1,len(mainsource[divs[1]][a[1]])):
                    copied_doppleganger[divs[0]][a[0]].append(mainsource[divs[0]][a[0]][i])
                    copied_doppleganger[divs[1]][a[1]].append(mainsource[divs[1]][a[1]][j])
                    result = callProcessor(copied_doppleganger)
                    count += 1
                    writer_obj.writerow([result])
                    copied_doppleganger = copy.deepcopy(doppleganger)


        elif (len(mainsource) == 3):
            print("for the 3")
            keys0 = list(mainsource[keysmain[0]])
            keys1 = list(mainsource[keysmain[1]])
            keys2 = list(mainsource[keysmain[2]])
            for x0 in range(1,len(keys0)):
                divs.append("0div")
                a.append(keys0[x0])
                doppleganger['0div'][keys0[x0]] = [mainsource['0div'][keys0[x0]][0]]
            for x1 in range(1,len(keys1)):
                divs.append("1div")
                a.append(keys1[x1])
                doppleganger['1div'][keys1[x1]] = [mainsource['1div'][keys1[x1]][0]]
            for x2 in range(1,len(keys2)):
                divs.append("2div")
                a.append(keys2[x2])
                doppleganger['2div'][keys2[x2]] = [mainsource['2div'][keys2[x2]][0]]

            copied_doppleganger = copy.deepcopy(doppleganger)


            print("doppleganger = ",doppleganger)
            print("divs = ",divs)
            print("a = ",a)
            print()

            for i in range(1,len(mainsource[divs[0]][a[0]])):
                for j in range(1,len(mainsource[divs[1]][a[1]])):
                    for k in range(1,len(mainsource[divs[2]][a[2]])):
                        for l in range(1,len(mainsource[divs[3]][a[3]])):
                            copied_doppleganger[divs[0]][a[0]].append(mainsource[divs[0]][a[0]][i])
                            copied_doppleganger[divs[1]][a[1]].append(mainsource[divs[1]][a[1]][j])
                            copied_doppleganger[divs[2]][a[2]].append(mainsource[divs[2]][a[2]][k])
                            copied_doppleganger[divs[3]][a[3]].append(mainsource[divs[3]][a[3]][l])
                            result = callProcessor(copied_doppleganger)
                            count += 1
                            writer_obj.writerow([result])
                            copied_doppleganger = copy.deepcopy(doppleganger)

        elif (len(doppleganger) == 4): 
            print("for the 4")
            keys0 = list(mainsource[keysmain[0]])
            keys1 = list(mainsource[keysmain[1]])
            keys2 = list(mainsource[keysmain[2]])
            keys3 = list(mainsource[keysmain[3]])
            for x0 in range(1,len(keys0)):
                divs.append("0div")
                a.append(keys0[x0])
                doppleganger['0div'][keys0[x0]] = [mainsource['0div'][keys0[x0]][0]]
            for x1 in range(1,len(keys1)):
                divs.append("1div")
                a.append(keys1[x1])
                doppleganger['1div'][keys1[x1]] = [mainsource['1div'][keys1[x1]][0]]
            for x2 in range(1,len(keys2)):
                divs.append("2div")
                a.append(keys2[x2])
                doppleganger['2div'][keys2[x2]] = [mainsource['2div'][keys2[x2]][0]]
            for x3 in range(1,len(keys3)):
                divs.append("3div")
                a.append(keys3[x3])
                doppleganger['3div'][keys3[x3]] = [mainsource['3div'][keys3[x3]][0]]


            copied_doppleganger = copy.deepcopy(doppleganger)


            print("doppleganger = ",doppleganger)
            print("divs = ",divs)
            print("a = ",a)
            print()

            for i in range(1,len(mainsource[divs[0]][a[0]])):
                for j in range(1,len(mainsource[divs[1]][a[1]])):
                    for k in range(1,len(mainsource[divs[2]][a[2]])):
                        for l in range(1,len(mainsource[divs[3]][a[3]])):
                            for m in range(1,len(mainsource[divs[4]][a[4]])):
                                for n in range(1,len(mainsource[divs[5]][a[5]])):
                                    copied_doppleganger[divs[0]][a[0]].append(mainsource[divs[0]][a[0]][i])
                                    copied_doppleganger[divs[1]][a[1]].append(mainsource[divs[1]][a[1]][j])
                                    copied_doppleganger[divs[2]][a[2]].append(mainsource[divs[2]][a[2]][k])
                                    copied_doppleganger[divs[3]][a[3]].append(mainsource[divs[3]][a[3]][l])
                                    copied_doppleganger[divs[4]][a[4]].append(mainsource[divs[4]][a[4]][m])
                                    copied_doppleganger[divs[5]][a[5]].append(mainsource[divs[5]][a[5]][n])
                                    result = callProcessor(copied_doppleganger)
                                    count += 1
                                    writer_obj.writerow([result])
                                    copied_doppleganger = copy.deepcopy(doppleganger)

        elif (len(doppleganger) == 5):
            print("for the 5")
            keys0 = list(mainsource[keysmain[0]])
            keys1 = list(mainsource[keysmain[1]])
            keys2 = list(mainsource[keysmain[2]])
            keys3 = list(mainsource[keysmain[3]])
            keys4 = list(mainsource[keysmain[4]])
            for x0 in range(1,len(keys0)):
                divs.append("0div")
                a.append(keys0[x0])
                doppleganger['0div'][keys0[x0]] = [mainsource['0div'][keys0[x0]][0]]
            for x1 in range(1,len(keys1)):
                divs.append("1div")
                a.append(keys1[x1])
                doppleganger['1div'][keys1[x1]] = [mainsource['1div'][keys1[x1]][0]]
            for x2 in range(1,len(keys2)):
                divs.append("2div")
                a.append(keys2[x2])
                doppleganger['2div'][keys2[x2]] = [mainsource['2div'][keys2[x2]][0]]
            for x3 in range(1,len(keys3)):
                divs.append("3div")
                a.append(keys3[x3])
                doppleganger['3div'][keys3[x3]] = [mainsource['3div'][keys3[x3]][0]]
            for x4 in range(1,len(keys4)):
                divs.append("4div")
                a.append(keys4[x4])
                doppleganger['4div'][keys4[x4]] = [mainsource['4div'][keys4[x4]][0]]

            copied_doppleganger = copy.deepcopy(doppleganger)


            print("doppleganger = ",doppleganger)
            print("divs = ",divs)
            print("a = ",a)
            print()

            for i in range(1,len(mainsource[divs[0]][a[0]])):
                for j in range(1,len(mainsource[divs[1]][a[1]])):
                    for k in range(1,len(mainsource[divs[2]][a[2]])):
                        for l in range(1,len(mainsource[divs[3]][a[3]])):
                            for m in range(1,len(mainsource[divs[4]][a[4]])):
                                for n in range(1,len(mainsource[divs[5]][a[5]])):
                                    for o in range(1,len(mainsource[divs[6]][a[6]])):
                                        for p in range(1,len(mainsource[divs[7]][a[7]])):
                                            copied_doppleganger[divs[0]][a[0]].append(mainsource[divs[0]][a[0]][i])
                                            copied_doppleganger[divs[1]][a[1]].append(mainsource[divs[1]][a[1]][j])
                                            copied_doppleganger[divs[2]][a[2]].append(mainsource[divs[2]][a[2]][k])
                                            copied_doppleganger[divs[3]][a[3]].append(mainsource[divs[3]][a[3]][l])
                                            copied_doppleganger[divs[4]][a[4]].append(mainsource[divs[4]][a[4]][m])
                                            copied_doppleganger[divs[5]][a[5]].append(mainsource[divs[5]][a[5]][n])
                                            copied_doppleganger[divs[6]][a[6]].append(mainsource[divs[6]][a[6]][o])
                                            copied_doppleganger[divs[7]][a[7]].append(mainsource[divs[7]][a[7]][p])                            
                                            result = callProcessor(copied_doppleganger)
                                            count += 1
                                            writer_obj.writerow([result])
                                            copied_doppleganger = copy.deepcopy(doppleganger)

        elif (len(doppleganger) == 6):
            print("for the 6")
            keys0 = list(mainsource[keysmain[0]])
            keys1 = list(mainsource[keysmain[1]])
            keys2 = list(mainsource[keysmain[2]])
            keys3 = list(mainsource[keysmain[3]])
            keys4 = list(mainsource[keysmain[4]])
            keys5 = list(mainsource[keysmain[5]])
            
            for x0 in range(1,len(keys0)):
                divs.append("0div")
                a.append(keys0[x0])
                doppleganger['0div'][keys0[x0]] = [mainsource['0div'][keys0[x0]][0]]
            for x1 in range(1,len(keys1)):
                divs.append("1div")
                a.append(keys1[x1])
                doppleganger['1div'][keys1[x1]] = [mainsource['1div'][keys1[x1]][0]]
            for x2 in range(1,len(keys2)):
                divs.append("2div")
                a.append(keys2[x2])
                doppleganger['2div'][keys2[x2]] = [mainsource['2div'][keys2[x2]][0]]
            for x3 in range(1,len(keys3)):
                divs.append("3div")
                a.append(keys3[x3])
                doppleganger['3div'][keys3[x3]] = [mainsource['3div'][keys3[x3]][0]]
            for x4 in range(1,len(keys4)):
                divs.append("4div")
                a.append(keys4[x4])
                doppleganger['4div'][keys4[x4]] = [mainsource['4div'][keys4[x4]][0]]
            for x5 in range(1,len(keys5)):
                divs.append("5div")
                a.append(keys5[x5])
                doppleganger['5div'][keys5[x5]] = [mainsource['5div'][keys5[x5]][0]]

            copied_doppleganger = copy.deepcopy(doppleganger)


            print("doppleganger = ",doppleganger)
            print("divs = ",divs)
            print("a = ",a)
            print()

            for i in range(1,len(mainsource[divs[0]][a[0]])):
                for j in range(1,len(mainsource[divs[1]][a[1]])):
                    for k in range(1,len(mainsource[divs[2]][a[2]])):
                        for l in range(1,len(mainsource[divs[3]][a[3]])):
                            for m in range(1,len(mainsource[divs[4]][a[4]])):
                                for n in range(1,len(mainsource[divs[5]][a[5]])):
                                    for o in range(1,len(mainsource[divs[6]][a[6]])):
                                        for p in range(1,len(mainsource[divs[7]][a[7]])):
                                            for q in range(1,len(mainsource[divs[8]][a[8]])):
                                                for r in range(1,len(mainsource[divs[9]][a[9]])):
                                                    copied_doppleganger[divs[0]][a[0]].append(mainsource[divs[0]][a[0]][i])
                                                    copied_doppleganger[divs[1]][a[1]].append(mainsource[divs[1]][a[1]][j])
                                                    copied_doppleganger[divs[2]][a[2]].append(mainsource[divs[2]][a[2]][k])
                                                    copied_doppleganger[divs[3]][a[3]].append(mainsource[divs[3]][a[3]][l])
                                                    copied_doppleganger[divs[4]][a[4]].append(mainsource[divs[4]][a[4]][m])
                                                    copied_doppleganger[divs[5]][a[5]].append(mainsource[divs[5]][a[5]][n])
                                                    copied_doppleganger[divs[6]][a[6]].append(mainsource[divs[6]][a[6]][o])
                                                    copied_doppleganger[divs[7]][a[7]].append(mainsource[divs[7]][a[7]][p])  
                                                    copied_doppleganger[divs[8]][a[8]].append(mainsource[divs[8]][a[8]][q])   
                                                    copied_doppleganger[divs[9]][a[9]].append(mainsource[divs[9]][a[9]][r])                         
                                                    result = callProcessor(copied_doppleganger)
                                                    count += 1
                                                    writer_obj.writerow([result])
                                                    copied_doppleganger = copy.deepcopy(doppleganger)
                                                    
        elif (len(doppleganger) == 7):
            print("for the 6")
            keys0 = list(mainsource[keysmain[0]])
            keys1 = list(mainsource[keysmain[1]])
            keys2 = list(mainsource[keysmain[2]])
            keys3 = list(mainsource[keysmain[3]])
            keys4 = list(mainsource[keysmain[4]])
            keys5 = list(mainsource[keysmain[5]])
            keys6 = list(mainsource[keysmain[6]])
            
            for x0 in range(1,len(keys0)):
                divs.append("0div")
                a.append(keys0[x0])
                doppleganger['0div'][keys0[x0]] = [mainsource['0div'][keys0[x0]][0]]
            for x1 in range(1,len(keys1)):
                divs.append("1div")
                a.append(keys1[x1])
                doppleganger['1div'][keys1[x1]] = [mainsource['1div'][keys1[x1]][0]]
            for x2 in range(1,len(keys2)):
                divs.append("2div")
                a.append(keys2[x2])
                doppleganger['2div'][keys2[x2]] = [mainsource['2div'][keys2[x2]][0]]
            for x3 in range(1,len(keys3)):
                divs.append("3div")
                a.append(keys3[x3])
                doppleganger['3div'][keys3[x3]] = [mainsource['3div'][keys3[x3]][0]]
            for x4 in range(1,len(keys4)):
                divs.append("4div")
                a.append(keys4[x4])
                doppleganger['4div'][keys4[x4]] = [mainsource['4div'][keys4[x4]][0]]
            for x5 in range(1,len(keys5)):
                divs.append("5div")
                a.append(keys5[x5])
                doppleganger['5div'][keys5[x5]] = [mainsource['5div'][keys5[x5]][0]]
            for x6 in range(1,len(keys6)):
                divs.append("6div")
                a.append(keys6[x6])
                doppleganger['6div'][keys6[x6]] = [mainsource['6div'][keys6[x6]][0]]

            copied_doppleganger = copy.deepcopy(doppleganger)


            print("doppleganger = ",doppleganger)
            print("divs = ",divs)
            print("a = ",a)
            print()

            for i in range(1,len(mainsource[divs[0]][a[0]])):
                for j in range(1,len(mainsource[divs[1]][a[1]])):
                    for k in range(1,len(mainsource[divs[2]][a[2]])):
                        for l in range(1,len(mainsource[divs[3]][a[3]])):
                            for m in range(1,len(mainsource[divs[4]][a[4]])):
                                for n in range(1,len(mainsource[divs[5]][a[5]])):
                                    for o in range(1,len(mainsource[divs[6]][a[6]])):
                                        for p in range(1,len(mainsource[divs[7]][a[7]])):
                                            for q in range(1,len(mainsource[divs[8]][a[8]])):
                                                for r in range(1,len(mainsource[divs[9]][a[9]])):
                                                    for s in range(1,len(mainsource[divs[10]][a[10]])):
                                                        for t in range(1,len(mainsource[divs[11]][a[11]])):
                                                            copied_doppleganger[divs[0]][a[0]].append(mainsource[divs[0]][a[0]][i])
                                                            copied_doppleganger[divs[1]][a[1]].append(mainsource[divs[1]][a[1]][j])
                                                            copied_doppleganger[divs[2]][a[2]].append(mainsource[divs[2]][a[2]][k])
                                                            copied_doppleganger[divs[3]][a[3]].append(mainsource[divs[3]][a[3]][l])
                                                            copied_doppleganger[divs[4]][a[4]].append(mainsource[divs[4]][a[4]][m])
                                                            copied_doppleganger[divs[5]][a[5]].append(mainsource[divs[5]][a[5]][n])
                                                            copied_doppleganger[divs[6]][a[6]].append(mainsource[divs[6]][a[6]][o])
                                                            copied_doppleganger[divs[7]][a[7]].append(mainsource[divs[7]][a[7]][p])  
                                                            copied_doppleganger[divs[8]][a[8]].append(mainsource[divs[8]][a[8]][q])   
                                                            copied_doppleganger[divs[9]][a[9]].append(mainsource[divs[9]][a[9]][r]) 
                                                            copied_doppleganger[divs[10]][a[10]].append(mainsource[divs[10]][a[10]][s])   
                                                            copied_doppleganger[divs[11]][a[11]].append(mainsource[divs[11]][a[11]][t])                          
                                                            result = callProcessor(copied_doppleganger)
                                                            count += 1
                                                            writer_obj.writerow([result])
                                                            copied_doppleganger = copy.deepcopy(doppleganger)


    while not os.path.exists(csv_file):
        time.sleep(2)  # Wait for 1 second before checking again
    df = pd.read_csv(csv_file)
    df_cleaned = df.drop_duplicates()
    total_rows = len(df_cleaned)
    if os.path.exists(csv_file):
        os.remove(csv_file)
        print("deleted last ",csv_file)
    
    df_cleaned.to_csv(csv_file, index=False)
    data = df_cleaned.values.tolist()
    while not os.path.exists(csv_file):
        time.sleep(2)  # Wait for 1 second before checking again
        
    print(count)
    print(total_rows)
    return {"count":total_rows,"result":data}
    # return {"count":count}

    
if __name__ == '__main__':
    app.run(debug=True, port=8000, host='0.0.0.0')



