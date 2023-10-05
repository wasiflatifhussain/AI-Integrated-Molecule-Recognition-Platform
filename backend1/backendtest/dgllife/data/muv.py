# -*- coding: utf-8 -*-
#
# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0
#
# MUV from MoleculeNet for the prediction of biological activities

import pandas as pd

from dgl.data.utils import get_download_dir, download, _get_dgl_url, extract_archive

from .csv_dataset import MoleculeCSVDataset

__all__ = ['MUV']

class MUV(MoleculeCSVDataset):
    r"""MUV from MoleculeNet for the prediction of biological activities

    Quoting [1], "The Maximum Unbiased Validation (MUV) group is another benchmark dataset
    selected from PubChem BioAssay by applying a refined nearest neighbor analysis. The MUV
    dataset contains 17 challenging tasks for around 90 thousand compounds and is specifically
    designed for validation of virtual screening techniques."

    References:

        * [1] MoleculeNet: A Benchmark for Molecular Machine Learning.
        * [2] DeepChem

    Parameters
    ----------
    smiles_to_graph: callable, str -> DGLGraph
        A function turning a SMILES string into a DGLGraph. If None, it uses
        :func:`dgllife.utils.SMILESToBigraph` by default.
    node_featurizer : callable, rdkit.Chem.rdchem.Mol -> dict
        Featurization for nodes like atoms in a molecule, which can be used to update
        ndata for a DGLGraph. Default to None.
    edge_featurizer : callable, rdkit.Chem.rdchem.Mol -> dict
        Featurization for edges like bonds in a molecule, which can be used to update
        edata for a DGLGraph. Default to None.
    load : bool
        Whether to load the previously pre-processed dataset or pre-process from scratch.
        ``load`` should be False when we want to try different graph construction and
        featurization methods and need to preprocess from scratch. Default to False.
    log_every : bool
        Print a message every time ``log_every`` molecules are processed. Default to 1000.
    cache_file_path : str
        Path to the cached DGLGraphs, default to 'muv_dglgraph.bin'.
    n_jobs : int
        The maximum number of concurrently running jobs for graph construction and featurization,
        using joblib backend. Default to 1.

    Examples
    --------

    >>> import torch
    >>> from dgllife.data import MUV
    >>> from dgllife.utils import SMILESToBigraph, CanonicalAtomFeaturizer

    >>> smiles_to_g = SMILESToBigraph(node_featurizer=CanonicalAtomFeaturizer())
    >>> dataset = MUV(smiles_to_g)
    >>> # Get size of the dataset
    >>> len(dataset)
    93087
    >>> # Get the 0th datapoint, consisting of SMILES, DGLGraph, labels, and masks
    >>> dataset[0]
    ('Cc1cccc(N2CCN(C(=O)C34CC5CC(CC(C5)C3)C4)CC2)c1C',
     Graph(num_nodes=26, num_edges=60,
           ndata_schemes={'h': Scheme(shape=(74,), dtype=torch.float32)}
           edata_schemes={}),
     tensor([0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0.]),
     tensor([0., 0., 0., 0., 0., 0., 0., 1., 0., 0., 0., 1., 0., 0., 0., 0., 0.]))

    The dataset instance also contains information about molecule ids.

    >>> dataset.ids[i]

    We can also get the id along with SMILES, DGLGraph, labels, and masks at once.

    >>> dataset.load_full = True
    >>> dataset[0]
    ('Cc1cccc(N2CCN(C(=O)C34CC5CC(CC(C5)C3)C4)CC2)c1C',
     Graph(num_nodes=26, num_edges=60,
           ndata_schemes={'h': Scheme(shape=(74,), dtype=torch.float32)}
           edata_schemes={}),
     tensor([0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0.]),
     tensor([0., 0., 0., 0., 0., 0., 0., 1., 0., 0., 0., 1., 0., 0., 0., 0., 0.]),
     'CID2999678')

    To address the imbalance between positive and negative samples, we can re-weight
    positive samples for each task based on the training datapoints.

    >>> train_ids = torch.arange(40000)
    >>> dataset.task_pos_weights(train_ids)
    tensor([ 537.5833,  458.0000,  424.8000,  413.6667,  463.8571, 1060.5000,
             568.3636,  386.7500,  921.1429,  523.9167,  487.0769,  480.8462,
            1262.8000,  702.1111,  571.3636,  528.0000,  485.2308])
    """
    def __init__(self,
                 smiles_to_graph=None,
                 node_featurizer=None,
                 edge_featurizer=None,
                 load=False,
                 log_every=1000,
                 cache_file_path='./muv_dglgraph.bin',
                 n_jobs=1):

        self._url = 'dataset/muv.zip'
        data_path = get_download_dir() + '/muv.zip'
        dir_path = get_download_dir() + '/muv'
        download(_get_dgl_url(self._url), path=data_path, overwrite=False)
        extract_archive(data_path, dir_path)
        df = pd.read_csv(dir_path + '/muv.csv')

        self.ids = df['mol_id'].tolist()
        self.load_full = False

        df = df.drop(columns=['mol_id'])

        super(MUV, self).__init__(df=df,
                                  smiles_to_graph=smiles_to_graph,
                                  node_featurizer=node_featurizer,
                                  edge_featurizer=edge_featurizer,
                                  smiles_column='smiles',
                                  cache_file_path=cache_file_path,
                                  load=load,
                                  log_every=log_every,
                                  init_mask=True,
                                  n_jobs=n_jobs)

        self.ids = [self.ids[i] for i in self.valid_ids]

    def __getitem__(self, item):
        """Get datapoint with index

        Parameters
        ----------
        item : int
            Datapoint index

        Returns
        -------
        str
            SMILES for the ith datapoint
        DGLGraph
            DGLGraph for the ith datapoint
        Tensor of dtype float32 and shape (T)
            Labels of the ith datapoint for all tasks. T for the number of tasks.
        Tensor of dtype float32 and shape (T)
            Binary masks of the ith datapoint indicating the existence of labels for all tasks.
        str, optional
            Id for the ith datapoint, returned only when ``self.load_full`` is True.
        """
        if self.load_full:
            return self.smiles[item], self.graphs[item], self.labels[item], \
                   self.mask[item], self.ids[item]
        else:
            return self.smiles[item], self.graphs[item], self.labels[item], self.mask[item]
