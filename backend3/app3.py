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
from functools import partial
from torch.utils.data import DataLoader
from tqdm import tqdm

from torch.utils.data import DataLoader
from tqdm import tqdm
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

@app.route("/preparecombos", methods=['POST'])
def preparecombos():
    mainsource = request.json.get('body')
    username = request.args.get("username")
    count = 0

    print(mainsource)
    # data = []
    indices = []

    csv_file = f"../backend1/structure_folder/{username}.csv"
    
    # if os.path.exists(csv_file):
    #     os.remove(csv_file)
    #     print("deleted ",csv_file)
        
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
    # print(core)
    return Chem.MolToSmiles(core,kekuleSmiles=True)
    


    
if __name__ == '__main__':
    app.run(debug=True, port=10000, host='0.0.0.0')