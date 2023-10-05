from flask import Flask, request,jsonify
from rdkit import Chem
from rdkit.Chem import AllChem as Chem
from rdkit.Chem import Draw,rdMolDescriptors,MolToSmiles
from PIL import Image
import base64
from io import BytesIO
from flask_cors import CORS
import ast

import json
import os
import pandas as pd
import torch

from functools import partial
from torch.utils.data import DataLoader
from tqdm import tqdm


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
import csv
from decimal import Decimal
import time

app = Flask(__name__)
CORS(app)


@app.route("/molcombogenerator" , methods=['POST'])
def molcombogenerator():
    data = request.get_json()
    target = int(data['params']['molmasstot'])
    molnum1 = int(data['params']['molnumtot1'])
    molnum2 = int(data['params']['molnumtot2'])
    coremol = data['params']['coremol']
    fragweights = ast.literal_eval(data['body'])
    print("target = ",target)
    print("molnum1 = ",molnum1)
    print("molnum2 = ",molnum2)
    print("coremol = ",coremol)
    print("fragweights = ",fragweights)

    weights = []
    for key,value in fragweights.items():
        weights.append(value)
    print(weights)
    combinations = combination(weights,target,molnum1,molnum2,coremol)
    resArr = []
    for i in range(len(combinations)):
        temp = []
        for j in range(len(combinations[i])):
            temp.append(weights.index(combinations[i][j]))
        resArr.append(temp)
    return resArr

def combination(weights, target, molnum1,molnum2,coremol):
    results = []
    current_combination = []
    def backtrack(start_index, current_mass):
        if current_mass > target:
            return
        if current_mass <= target:
            if (len(current_combination[:]) >= molnum1 and len(current_combination[:]) <= molnum2 and coremol in current_combination[:]):
                results.append(current_combination[:])
        for i in range(start_index, len(weights)):
            current_combination.append(weights[i])
            backtrack(i + 1, current_mass + weights[i])
            current_combination.pop()
    backtrack(0, 0)
    return results

@app.route("/getMassResult3",methods=['POST'])
def getMassResult3():
    coreSmiles = request.get_json()
    userName = request.args.get('username')
    # print(coreSmiles)
    splitPattern = r"\\r|\\n|\\r\\n|\\n\\r|\\t"
    coreSmiles = re.split(splitPattern,coreSmiles['body'])
    coreSmiles = [s for s in coreSmiles if s]
    if (len(coreSmiles) == 0):
        return "Please send a non-empty smiles."
    coreSmiles = coreSmiles[1:-1]
    # print(coreSmiles)
    smi_list = coreSmiles
    # print(smi_list)

    deleteBHFile(userName)
    write_lmdb(smi_list, job_name=userName, outpath='./molecule_file', nthreads=96) 
    
    job_name = userName # lmdb filename
    molecular_path='./molecule_file' # path that lmdb file saved
    data_path='./'  # replace to your data path
    results_path= './'  # replace to your results path
    weight_path='./BH407_checkpoint_best.pt'  # replace to your ckpt path
    predict_path=f"./{job_name}.out.pkl"  # replace to your results path
    batch_size=32
    task_name='molecule_file' # data folder name 
    task_num=4
    loss_func='finetune_smooth_mae'
    dict_name='dict.txt'
    conf_size=1
    only_polar=0
    i=0
    
    os.environ['CUDA_VISIBLE_DEVICES'] = '0'
    batch = "true"
    process = subprocess.Popen(["python","./one_molecular_infer_BH407.py",userName, batch],stdout=subprocess.PIPE)
    return "done3"

@app.route("/getMassResult2",methods=['POST'])
def getMassResult2():
    coreSmiles = request.get_json()
    userName = request.args.get('username')
    print("username",userName)

    splitPattern = r"\\r|\\n|\\r\\n|\\n\\r|\\t"
    coreSmiles = re.split(splitPattern,coreSmiles['body'])
    coreSmiles = [s for s in coreSmiles if s]
    if (len(coreSmiles) == 0):
        return "Please send a non-empty smiles."
    coreSmiles = coreSmiles[1:-1]

    smi_list = coreSmiles


    deleteBNFile(userName)
    
    write_lmdb(smi_list, job_name=userName, outpath='./molecule_file', nthreads=96) 
    
    job_name = '' # lmdb filename
    molecular_path='./molecule_file' # path that lmdb file saved
    data_path='./'  # replace to your data path
    results_path= './'  # replace to your results path
    weight_path='./BN648_cam_b3lyp_checkpoint_best.pt'  # replace to your ckpt path
    predict_path=f"./{job_name}.out.pkl"  # replace to your results path
    batch_size=32
    task_name='molecule_file' # data folder name 
    task_num=5
    loss_func='finetune_smooth_mae'
    dict_name='dict.txt'
    conf_size=1
    only_polar=0
    i=0
    
    os.environ['CUDA_VISIBLE_DEVICES'] = '0'
    batch = "true"
    process = subprocess.Popen(["python","./one_molecular_infer_BN648.py",userName,batch],stdout=subprocess.PIPE)
    return "done2"

@app.route("/getStructMassResult3",methods=['POST'])
def getStructMassResult3():
    coreSmiles = []
    userName = request.get_json()["body"]
    file_path = f"../backend1/structure_folder/{userName}.csv"
    print(file_path)
    try:
        # Open the CSV file
        with open(file_path, newline='') as csvfile:
            # Create a CSV reader object
            csv_reader = csv.reader(csvfile)
            
            # Iterate over each row in the CSV file
            for row in csv_reader:
                # Add the row as a separate element to coreSmiles
                coreSmiles.append(row[0])
        
    except FileNotFoundError:
        # Handle the case when the file is not found
        return "CSV file not found"
    
    coreSmiles.append("")
    if (len(coreSmiles) == 0):
        return "Please send a non-empty smiles."
    coreSmiles = coreSmiles[1:-1]
    # print(coreSmiles)
    smi_list = coreSmiles
    # print(smi_list)

    deleteBHFile(userName)
    write_lmdb(smi_list, job_name=userName, outpath='./molecule_file', nthreads=96) 
    
    job_name = userName # lmdb filename
    molecular_path='./molecule_file' # path that lmdb file saved
    data_path='./'  # replace to your data path
    results_path= './'  # replace to your results path
    weight_path='./BH407_checkpoint_best.pt'  # replace to your ckpt path
    predict_path=f"./{job_name}.out.pkl"  # replace to your results path
    batch_size=32
    task_name='molecule_file' # data folder name 
    task_num=4
    loss_func='finetune_smooth_mae'
    dict_name='dict.txt'
    conf_size=1
    only_polar=0
    i=0
    
    os.environ['CUDA_VISIBLE_DEVICES'] = '0'
    batch = "true"
    process = subprocess.Popen(["python","./one_molecular_infer_BH407.py",userName,batch],stdout=subprocess.PIPE)
    return "done3"

@app.route("/getStructMassResult2",methods=['POST'])
def getStructMassResult2():
    coreSmiles = []
    userName = request.get_json()["body"]
    file_path = f"../backend1/structure_folder/{userName}.csv"
    print(file_path)
    try:
        # Open the CSV file
        with open(file_path, newline='') as csvfile:
            # Create a CSV reader object
            csv_reader = csv.reader(csvfile)
            
            # Iterate over each row in the CSV file
            for row in csv_reader:
                # Add the row as a separate element to coreSmiles
                coreSmiles.append(row[0])
        
    except FileNotFoundError:
        # Handle the case when the file is not found
        return "CSV file not found"
    
    coreSmiles.append("")
    if (len(coreSmiles) == 0):
        return "Please send a non-empty smiles."
    coreSmiles = coreSmiles[1:-1]

    smi_list = coreSmiles
    print(smi_list)

    deleteBNFile(userName)
    
    write_lmdb(smi_list, job_name=userName, outpath='./molecule_file', nthreads=96) 
    
    job_name = '' # lmdb filename
    molecular_path='./molecule_file' # path that lmdb file saved
    data_path='./'  # replace to your data path
    results_path= './'  # replace to your results path
    weight_path='./BN648_cam_b3lyp_checkpoint_best.pt'  # replace to your ckpt path
    predict_path=f"./{job_name}.out.pkl"  # replace to your results path
    batch_size=32
    task_name='molecule_file' # data folder name 
    task_num=5
    loss_func='finetune_smooth_mae'
    dict_name='dict.txt'
    conf_size=1
    only_polar=0
    i=0
    
    os.environ['CUDA_VISIBLE_DEVICES'] = '0'
    batch = "true"
    process = subprocess.Popen(["python","./one_molecular_infer_BN648.py",userName, batch],stdout=subprocess.PIPE)
    return "done2"

def deleteBNFile(username):
    file_path = './molecule_file_BN_'+username+'.csv'
    if os.path.exists(file_path):
        os.remove(file_path)
        print("deleted bn")
    else:
        print("no detect")

def deleteBHFile(username):
    file_path = './molecule_file_BH_'+username+'.csv'
    if os.path.exists(file_path):
        os.remove(file_path)
        print("deleted bh")
    else:
        print("no detect")

@app.route("/getBNMass")
def getBNMass():
    print("here")
    userName = request.args.get('username')
    csv_file = './molecule_file_BN_'+userName+'.csv'
    
    predictions = []
    smiles_list = []
    homos = []
    lumos = []
    s1 = []
    s2 = []
    homos_corr = []
    lumos_corr = []
    s1_corr = []
    
    while not os.path.exists(csv_file):
        # print("stop")
        time.sleep(2)  # Wait for 1 second before checking again
        
    with open(csv_file, 'r') as file:
        reader = csv.reader(file)
        next(reader)  # Skip the first row
        for row in reader:
            smilesval, homoval, lumoval, s1val, t1val = row
            homoval = float(homoval)
            lumoval = float(lumoval)
            s1val = float(s1val)
            t1val = float(t1val)
            predictions.append([smilesval, homoval, lumoval, s1val, t1val])
            homos.append(homoval)
            lumos.append(lumoval)
            s1.append(s1val)
            s2.append(t1val)
            homos_corr.append((homoval - 0.9899) / 1.1206)
            lumos_corr.append((lumoval - 2.0041) / 1.385)
            s1_corr.append((s1val - 0.4113) / 1.0831)
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
        plt.hist(homos_corr, bins=binlen,color="#f99f9f",edgecolor="#f54343")
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
        plt.hist(lumos_corr, bins=binlen2,color="#f99f9f",edgecolor="#f54343")
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
        plt.hist(s1_corr, bins=binlen3,color="#f99f9f",edgecolor="#f54343")
        plt.xlabel('Values',fontsize=15)
        plt.ylabel('Frequency',fontsize=15)
        plt.title('S1 (Sol.)',fontsize=15)
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
        plt.title('T1',fontsize=15)
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

@app.route("/getBHMass")
def getBHMass():
    print("here")
    userName = request.args.get('username')
    csv_file = './molecule_file_BH_'+userName+'.csv'
    
    predictions = []
    smiles_list = []
    homos = []
    lumos = []
    s1 = []
    s2 = []
    homos_corr = []
    lumos_corr = []

    while not os.path.exists(csv_file):
        time.sleep(2)  # Wait for 1 second before checking again
    start_time = time.time()
    with open(csv_file, 'r') as file:
        reader = csv.reader(file)
        next(reader)  # Skip the first row
        for row in reader:
            smilesval, homoval, lumoval, s1val, t1val = row
            homoval = float(homoval)
            lumoval = float(lumoval)
            s1val = float(s1val)
            t1val = float(t1val)
            predictions.append([smilesval, homoval, lumoval, s1val, t1val])
            homos.append(homoval)
            lumos.append(lumoval)
            s1.append(s1val)
            s2.append(t1val)
            homos_corr.append((homoval - 0.9899) / 1.1206)
            lumos_corr.append((lumoval - 2.0041) / 1.385)
    # print(homos)

    end_time1 = time.time()
            
    if (len(homos) == 0 or len(lumos) == 0 or len(s1) == 0 or len(s2) == 0):
        return "Not a valid file"
    else:
        plt.switch_backend('Agg')
        
        fig = plt.figure()
        binlen = len(homos)//20
        if (binlen <= 0):
            binlen = 1
        print("binlen = ",binlen)
        plt.hist(homos_corr, bins=binlen,color="#f99f9f",edgecolor="#f54343")
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
        plt.hist(lumos_corr, bins=binlen2,color="#f99f9f",edgecolor="#f54343")
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
        plt.hist(s1, bins=binlen3,color="#f99f9f",edgecolor="#f54343")
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
        plt.title('T1',fontsize=15)
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
        end_time2 = time.time()

        
        print("time to read file",end_time1 - start_time)
        print("time for data prep",end_time2 - start_time)
        return {'predictions': predictions,'homos':encoded_image, 'lumos':encoded_image2,'s1':encoded_image3,'s2':encoded_image4}
        #return predictions

@app.route("/getResult4")
def getResult4():
    coreSmiles = request.args.get("smiles")
    username = request.args.get("username")
    # print(type(coreSmiles))
    if (len(coreSmiles) == 0):
        return "Please send a non-empty smiles."

    smi_list = [coreSmiles]
    job_name = 'molecule' # lmdb filename
    molecular_path='./molecule_file' # path that lmdb file saved
    data_path='./'  # replace to your data path
    results_path= './'  # replace to your results path
    weight_path='./BH407_checkpoint_best.pt'  # replace to your ckpt path
    predict_path=f"./{job_name}.out.pkl"  # replace to your results path
    batch_size=32
    task_name='molecule_file' # data folder name 
    task_num=4
    loss_func='finetune_smooth_mae'
    dict_name='dict.txt'
    conf_size=1
    only_polar=0
    # i=0
    
    write_lmdb(smi_list, job_name=username, outpath=molecular_path, nthreads=16)
    
    os.environ['CUDA_VISIBLE_DEVICES'] = '0'
    batch = "false"
    process = subprocess.Popen(["python","./one_molecular_infer_BH407.py",username,batch],stdout=subprocess.PIPE)
    output,error = process.communicate()
    print(output[173:])
    return output[173:]

@app.route("/getResult3")
def getResult3():
    
    coreSmiles = request.args.get("smiles")
    username = request.args.get("username")
    # print(type(coreSmiles))
    if (len(coreSmiles) == 0):
        return "Please send a non-empty smiles."

    
    smi_list = [coreSmiles]
    # print(smi_list)


    
    # print("comes here1")
    write_lmdb(smi_list, job_name=username, outpath='./molecule_file', nthreads=96)    # gets blocked here
    # print("comes here2")
    
    job_name = username # lmdb filename
    molecular_path='./molecule_file' # path that lmdb file saved
    data_path='./'  # replace to your data path
    results_path= './'  # replace to your results path
    weight_path='./BN648_cam_b3lyp_checkpoint_best.pt'  # replace to your ckpt path
    predict_path=f"./{job_name}.out.pkl"  # replace to your results path
    batch_size=32
    task_name='molecule_file' # data folder name 
    task_num=5
    loss_func='finetune_smooth_mae'
    dict_name='dict.txt'
    conf_size=1
    only_polar=0
    i=0
    

    os.environ['CUDA_VISIBLE_DEVICES'] = '0'
    batch = "false"
    process = subprocess.Popen(["python","./one_molecular_infer_BN648.py",username,batch],stdout=subprocess.PIPE)
    output,error = process.communicate()
    print("comes here")
    print(output[173:])
    return output[173:]


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
    target = 0
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


if __name__ == '__main__':
    # run app in debug mode on port 5000
    app.run(debug=True, port=9000, host='0.0.0.0')
    
