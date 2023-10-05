# Copyright (c) DP Technology.
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

import logging
import os

import numpy as np
from unicore.data import (
    Dictionary,
    NestedDictionaryDataset,
    LMDBDataset,
    AppendTokenDataset,
    PrependTokenDataset,
    RightPadDataset,
    SortDataset,
    TokenizeDataset,
    RightPadDataset2D,
    RawLabelDataset,
    RawArrayDataset,
    FromNumpyDataset,
)
from unimol.data import (
    KeyDataset,
    ConformerSampleDataset,
    DistanceDataset,
    EdgeTypeDataset,
    RemoveHydrogenDataset,
    AtomTypeDataset,
    NormalizeDataset,
    CroppingDataset,
    RightPadDatasetCoord,
    data_utils,
)

from unimol.data.tta_dataset import TTADataset
from unicore.tasks import UnicoreTask, register_task


logger = logging.getLogger(__name__)

task_metainfo = {
    "esol": {
        "mean": -3.0501019503546094,
        "std": 2.096441210089345,
        "target_name": "logSolubility",
    },
    "freesolv": {
        "mean": -3.8030062305295944,
        "std": 3.8478201171088138,
        "target_name": "freesolv",
    },
    "lipo": {"mean": 2.186336, "std": 1.203004, "target_name": "lipo"},
    "qm7dft": {
        "mean": -1544.8360893118609,
        "std": 222.8902092792289,
        "target_name": "u0_atom",
    },
    "qm8dft": {
        "mean": [
            0.22008500524052105,
            0.24892658759891675,
            0.02289283121913152,
            0.043164444107224746,
            0.21669716560818883,
            0.24225989336408812,
            0.020287111373358993,
            0.03312609817084387,
            0.21681478862847584,
            0.24463634931699113,
            0.02345177178004201,
            0.03730141834205415,
        ],
        "std": [
            0.043832862248693226,
            0.03452326954549232,
            0.053401140662012285,
            0.0730556474716259,
            0.04788020599385645,
            0.040309670766319,
            0.05117163534626215,
            0.06030064428723054,
            0.04458294838213221,
            0.03597696243350195,
            0.05786865052149905,
            0.06692733477994665,
        ],
        "target_name": [
            "E1-CC2",
            "E2-CC2",
            "f1-CC2",
            "f2-CC2",
            "E1-PBE0",
            "E2-PBE0",
            "f1-PBE0",
            "f2-PBE0",
            "E1-CAM",
            "E2-CAM",
            "f1-CAM",
            "f2-CAM",
        ],
    },
    "qm9dft": {
        "mean": [-0.23997669940621352, 0.011123767412331285, 0.2511003712141015],
        "std": [0.02213143402267657, 0.046936069870866196, 0.04751888787058615],
        "target_name": ["homo", "lumo", "gap"],
    },
    "pcqm": {
        "mean": [-5.6524285740702700, -1.0516129187209500, 
                 4.0724507141497100, 3.0598001309274600],
        "std": [0.4291864247171450, 0.7034786412425710, 
                0.6932857832752130, 0.5331622900675910],
        "target_name": ["homo", "lumo", "s1","t1"],
    },
    "pcqm4m100K": {
        "mean": [5.33829305],
        "std": [1.275088164],
        "target_name": ["homolumogap"],
    },
    "BN_648_cam_b3lyp": {
        "mean": [3.218297222, 3.689759105, 3.217428858, 
                 -1.752622865, -5.061926358],
        "std": [0.226148499, 0.282869479, 0.227074731,
                0.370901885, 0.331173442],
        "target_name": ["ES1", "ES2", "ET1","LUMO","HOMO"],
    },
    "BN674": {
        "mean": [-5.051644608, -1.74136286, 
                 2.545023591, 2.85080549],
        "std": [0.331561129, 0.374006159, 
                0.272391882, 0.228166593],
        "target_name": ["homo", "lumo", "s1","si"],
    },
    "HTMRP": {
        "mean": [-5.260161386, -2.308612085,
                 3.07323952, 2.576077884],
        "std": [0.134196521, 0.120497895,
                0.186867647, 0.16235358],
        "target_name": ["homo", "lumo", "s1","t1"],
    },
    "BH": {
        "mean": [-5.520815058216346,-2.739092337084135,
                 2.9342819095793264,1.7048051962860575],
        "std": [0.17010295118200877,0.11884350681565772,
                 0.27406979522527425,0.17812240428840126],
        "target_name": ["homo", "lumo", "s1","t1"],
    },
    "chromophore": {
        "mean": [428.4230361310345, 502.4329615599138],
        "std": [80.93970672038719, 88.09206497067399],
        "target_name": ["Absorption max (nm)", "Emission max (nm)"],
    },
    "BH416": {
        "mean": [-5.520815058216346,-2.739092337084135,
                 2.9342819095793264,1.7048051962860575],
        "std": [0.17010295118200877,0.11884350681565772,
                 0.27406979522527425,0.17812240428840126],
        "target_name": ["HOMO", "LUMO", "S1","T1"],
    },
}


@register_task("mol_finetune")
class UniMolFinetuneTask(UnicoreTask):
    """Task for training transformer auto-encoder models."""

    @staticmethod
    def add_args(parser):
        """Add task-specific arguments to the parser."""
        parser.add_argument("data", help="downstream data path")
        parser.add_argument("--task-name", type=str, help="downstream task name")
        parser.add_argument(
            "--classification-head-name",
            default="classification",
            help="finetune downstream task name",
        )
        parser.add_argument(
            "--num-classes",
            default=1,
            type=int,
            help="finetune downstream task classes numbers",
        )
        parser.add_argument("--reg", action="store_true", help="regression task")
        parser.add_argument("--no-shuffle", action="store_true", help="shuffle data")
        parser.add_argument(
            "--conf-size",
            default=10,
            type=int,
            help="number of conformers generated with each molecule",
        )
        parser.add_argument(
            "--remove-hydrogen",
            action="store_true",
            help="remove hydrogen atoms",
        )
        parser.add_argument(
            "--remove-polar-hydrogen",
            action="store_true",
            help="remove polar hydrogen atoms",
        )
        parser.add_argument(
            "--max-atoms",
            type=int,
            default=256,
            help="selected maximum number of atoms in a molecule",
        )
        parser.add_argument(
            "--dict-name",
            default="dict.txt",
            help="dictionary file",
        )
        parser.add_argument(
            "--only-polar",
            default=1,
            type=int,
            help="1: only reserve polar hydrogen; 0: no hydrogen; -1: all hydrogen ",
        )

    def __init__(self, args, dictionary):
        super().__init__(args)
        self.dictionary = dictionary
        self.seed = args.seed
        # add mask token
        self.mask_idx = dictionary.add_symbol("[MASK]", is_special=True)
        if self.args.only_polar > 0:
            self.args.remove_polar_hydrogen = True
        elif self.args.only_polar < 0:
            self.args.remove_polar_hydrogen = False
        else:
            self.args.remove_hydrogen = True
        if self.args.task_name in task_metainfo:
            # for regression task, pre-compute mean and std
            self.mean = task_metainfo[self.args.task_name]["mean"]
            self.std = task_metainfo[self.args.task_name]["std"]

    @classmethod
    def setup_task(cls, args, **kwargs):
        dictionary = Dictionary.load(os.path.join(args.data, args.dict_name))
        logger.info("dictionary: {} types".format(len(dictionary)))
        return cls(args, dictionary)

    def load_dataset(self, split, **kwargs):
        """加载给定的数据集分割。
        Args:
            split (str): 数据源的名称（例如：train）
        """
        # 构建分割路径
        split_path = os.path.join(self.args.data, self.args.task_name, split + ".lmdb")
        # 使用 LMDBDataset 类加载数据集
        dataset = LMDBDataset(split_path)

        if split == "train":
            # 对训练集进行预处理
            tgt_dataset = KeyDataset(dataset, "target")  # 提取 "target" 键的子数据集
            smi_dataset = KeyDataset(dataset, "smi")  # 提取 "smi" 键的子数据集
            sample_dataset = ConformerSampleDataset(
                dataset, self.args.seed, "atoms", "coordinates"
            )  # 使用 ConformerSampleDataset 类构建样本数据集
            dataset = AtomTypeDataset(dataset, sample_dataset)  # 使用 AtomTypeDataset 类构建原子类型数据集
        else:
            # 对验证集和测试集进行预处理
            dataset = TTADataset(
                dataset, self.args.seed, "atoms", "coordinates", self.args.conf_size
            )  # 使用 TTADataset 类构建时域数据集
            dataset = AtomTypeDataset(dataset, dataset)  # 使用 AtomTypeDataset 类构建原子类型数据集
            tgt_dataset = KeyDataset(dataset, "target")  # 提取 "target" 键的子数据集
            smi_dataset = KeyDataset(dataset, "smi")  # 提取 "smi" 键的子数据集

        dataset = RemoveHydrogenDataset(
            dataset,
            "atoms",
            "coordinates",
            self.args.remove_hydrogen,
            self.args.remove_polar_hydrogen,
        )  # 使用 RemoveHydrogenDataset 类移除氢原子
        dataset = CroppingDataset(
            dataset, self.seed, "atoms", "coordinates", self.args.max_atoms
        )  # 使用 CroppingDataset 类进行样本裁剪
        dataset = NormalizeDataset(dataset, "coordinates", normalize_coord=True)  # 使用 NormalizeDataset 类对坐标进行标准化处理
        src_dataset = KeyDataset(dataset, "atoms")  # 提取 "atoms" 键的子数据集
        src_dataset = TokenizeDataset(
            src_dataset, self.dictionary, max_seq_len=self.args.max_seq_len
        )  # 使用 TokenizeDataset 类对 "atoms" 数据进行分词处理

        coord_dataset = KeyDataset(dataset, "coordinates")  # 提取 "coordinates" 键的子数据集


        def PrependAndAppend(dataset, pre_token, app_token):
            dataset = PrependTokenDataset(dataset, pre_token)
            return AppendTokenDataset(dataset, app_token)

        src_dataset = PrependAndAppend(
            src_dataset, self.dictionary.bos(), self.dictionary.eos()
        )
        edge_type = EdgeTypeDataset(src_dataset, len(self.dictionary))
        coord_dataset = FromNumpyDataset(coord_dataset)
        coord_dataset = PrependAndAppend(coord_dataset, 0.0, 0.0)
        distance_dataset = DistanceDataset(coord_dataset)

        nest_dataset = NestedDictionaryDataset(
            {
                "net_input": {
                    "src_tokens": RightPadDataset(
                        src_dataset,
                        pad_idx=self.dictionary.pad(),
                    ),
                    "src_coord": RightPadDatasetCoord(
                        coord_dataset,
                        pad_idx=0,
                    ),
                    "src_distance": RightPadDataset2D(
                        distance_dataset,
                        pad_idx=0,
                    ),
                    "src_edge_type": RightPadDataset2D(
                        edge_type,
                        pad_idx=0,
                    ),
                },
                "target": {
                    "finetune_target": RawLabelDataset(tgt_dataset),
                },
                "smi_name": RawArrayDataset(smi_dataset),
            },
        )
        if not self.args.no_shuffle and split == "train":
            with data_utils.numpy_seed(self.args.seed):
                shuffle = np.random.permutation(len(src_dataset))

            self.datasets[split] = SortDataset(
                nest_dataset,
                sort_order=[shuffle],
            )
        else:
            self.datasets[split] = nest_dataset

    def build_model(self, args):
        from unicore import models

        model = models.build_model(args, self)
        model.register_classification_head(
            self.args.classification_head_name,
            num_classes=self.args.num_classes,
        )
        return model
