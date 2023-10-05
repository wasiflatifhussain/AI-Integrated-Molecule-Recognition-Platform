import networkx as nx
import matplotlib.pyplot as plt
import matplotlib

import numpy as np
import matplotlib.rcsetup as rcsetup
import tkinter

from matplotlib import pyplot as plt
import numpy as np
from rdkit import Chem
from rdkit.Chem import Draw,rdMolDescriptors,MolToSmiles
import csv

def add_atom_index(mol):
    atoms = mol.GetNumAtoms()
    for i in range( atoms ):
        mol.GetAtomWithIdx(i).SetProp(
            'molAtomMapNumber', str(mol.GetAtomWithIdx(i).GetIdx()))
    return mol

bond_list = [Chem.rdchem.BondType.UNSPECIFIED,
             Chem.rdchem.BondType.SINGLE,     #1
             Chem.rdchem.BondType.DOUBLE,     #2
             Chem.rdchem.BondType.TRIPLE,
             Chem.rdchem.BondType.QUADRUPLE,
             Chem.rdchem.BondType.QUINTUPLE,
             Chem.rdchem.BondType.HEXTUPLE,
             Chem.rdchem.BondType.ONEANDAHALF,
             Chem.rdchem.BondType.TWOANDAHALF,
             Chem.rdchem.BondType.THREEANDAHALF,
             Chem.rdchem.BondType.FOURANDAHALF,
             Chem.rdchem.BondType.FIVEANDAHALF,
             Chem.rdchem.BondType.AROMATIC,    #12
             Chem.rdchem.BondType.IONIC,
             Chem.rdchem.BondType.HYDROGEN,
             Chem.rdchem.BondType.THREECENTER,
             Chem.rdchem.BondType.DATIVEONE,
             Chem.rdchem.BondType.DATIVE,
             Chem.rdchem.BondType.DATIVEL,
             Chem.rdchem.BondType.DATIVER,
             Chem.rdchem.BondType.OTHER,
             Chem.rdchem.BondType.ZERO]

def connect(mol_1, mol_2, bond):

    point_1 = bond[0]
    point_2 = bond[1]
    adjacency_matrix_1 = Chem.rdmolops.GetAdjacencyMatrix(mol_1)
    for bond in mol_1.GetBonds():
        adjacency_matrix_1[bond.GetBeginAtomIdx(), bond.GetEndAtomIdx()] = bond_list.index(bond.GetBondType())
        adjacency_matrix_1[bond.GetEndAtomIdx(), bond.GetBeginAtomIdx()] = bond_list.index(bond.GetBondType())

    adjacency_matrix_2 = Chem.rdmolops.GetAdjacencyMatrix(mol_2)
    for bond in mol_2.GetBonds():
        adjacency_matrix_2[bond.GetBeginAtomIdx(), bond.GetEndAtomIdx()] = bond_list.index(bond.GetBondType())
        adjacency_matrix_2[bond.GetEndAtomIdx(), bond.GetBeginAtomIdx()] = bond_list.index(bond.GetBondType())

    atoms_1 = []
    for atom in mol_1.GetAtoms():
        atoms_1.append(atom.GetSymbol())
    atoms_2 = []
    for atom in mol_2.GetAtoms():
        atoms_2.append(atom.GetSymbol())
    atoms = atoms_1+atoms_2

    adjacency_matrix = adjacency_matrix_1.copy()
    adjacency_matrix = np.c_[adjacency_matrix, np.zeros(
            [adjacency_matrix.shape[0], len(atoms_2)], dtype='int32')]
    adjacency_matrix = np.r_[adjacency_matrix, np.zeros(
            [len(atoms_2), adjacency_matrix.shape[1]], dtype='int32')]
    adjacency_matrix[len(atoms_1):, len(atoms_1):] = adjacency_matrix_2

    #New single bond
    adjacency_matrix[point_1, len(atoms_1)+point_2] = 1
    adjacency_matrix[len(atoms_1)+point_2, point_1] = 1

    new_mol = Chem.RWMol()
    atom_index = []
    for atom_number in range(len(atoms)):
        atom = Chem.Atom(atoms[atom_number])
        molecular_index = new_mol.AddAtom(atom)
        atom_index.append(molecular_index)
    for index_x, row_vector in enumerate(adjacency_matrix):
        for index_y, bond in enumerate(row_vector):
            if index_y <= index_x:
                continue
            if bond == 0:
                continue
            else:
                new_mol.AddBond(atom_index[index_x], atom_index[index_y], bond_list[bond])
    return new_mol.GetMol()


def fuse(mol_1, mol_2, bond_1, bond_2):

    adjacency_matrix_1 = Chem.rdmolops.GetAdjacencyMatrix(mol_1)
    for bond in mol_1.GetBonds():
        adjacency_matrix_1[bond.GetBeginAtomIdx(), bond.GetEndAtomIdx()] = bond_list.index(bond.GetBondType())
        adjacency_matrix_1[bond.GetEndAtomIdx(), bond.GetBeginAtomIdx()] = bond_list.index(bond.GetBondType())

    adjacency_matrix_2 = Chem.rdmolops.GetAdjacencyMatrix(mol_2)
    for bond in mol_2.GetBonds():
        adjacency_matrix_2[bond.GetBeginAtomIdx(), bond.GetEndAtomIdx()] = bond_list.index(bond.GetBondType())
        adjacency_matrix_2[bond.GetEndAtomIdx(), bond.GetBeginAtomIdx()] = bond_list.index(bond.GetBondType())

    atoms_1 = []
    for atom in mol_1.GetAtoms():
        atoms_1.append(atom.GetSymbol())
    atoms_2 = []
    for atom in mol_2.GetAtoms():
        atoms_2.append(atom.GetSymbol())
    atoms = atoms_1+atoms_2

    adjacency_matrix = adjacency_matrix_1.copy()
    adjacency_matrix = np.c_[adjacency_matrix, np.zeros(
            [adjacency_matrix.shape[0], len(atoms_2)], dtype='int32')]
    adjacency_matrix = np.r_[adjacency_matrix, np.zeros(
            [len(atoms_2), adjacency_matrix.shape[1]], dtype='int32')]
    adjacency_matrix[len(atoms_1):, len(atoms_1):] = adjacency_matrix_2

    adjacency_matrix[len(atoms_1):,bond_1[0]] += adjacency_matrix[len(atoms_1):,len(atoms_1)+bond_2[0]]
    adjacency_matrix[len(atoms_1):,bond_1[1]] += adjacency_matrix[len(atoms_1):,len(atoms_1)+bond_2[1]]
    adjacency_matrix[bond_1[0],len(atoms_1):] += adjacency_matrix[len(atoms_1)+bond_2[0],len(atoms_1):]
    adjacency_matrix[bond_1[1],len(atoms_1):] += adjacency_matrix[len(atoms_1)+bond_2[1],len(atoms_1):]

    atoms=np.delete(atoms, [len(atoms_1)+bond_2[0],len(atoms_1)+bond_2[1]], axis=0)

    adjacency_matrix=np.delete(adjacency_matrix, [len(atoms_1)+bond_2[0],len(atoms_1)+bond_2[1]], axis=0)
    adjacency_matrix=np.delete(adjacency_matrix, [len(atoms_1)+bond_2[0],len(atoms_1)+bond_2[1]], axis=1)
    
    new_mol = Chem.RWMol()
    atom_index = []
    for atom_number in range(len(atoms)):
        atom = Chem.Atom(atoms[atom_number])
        molecular_index = new_mol.AddAtom(atom)
        atom_index.append(molecular_index)
    for index_x, row_vector in enumerate(adjacency_matrix):
        for index_y, bond in enumerate(row_vector):
            if index_y <= index_x:
                continue
            if bond == 0:
                continue
            else:
                new_mol.AddBond(atom_index[index_x], atom_index[index_y], bond_list[bond])
    return new_mol.GetMol()

