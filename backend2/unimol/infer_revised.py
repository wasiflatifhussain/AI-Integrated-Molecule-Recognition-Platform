#!/usr/bin/env python3 -u
# Copyright (c) DP Techonology, Inc. and its affiliates.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

import logging
import os
import sys
import pickle
import torch
from unicore import checkpoint_utils, distributed_utils, options, utils
from unicore.logging import progress_bar
from unicore import tasks

logging.basicConfig(
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    level=os.environ.get("LOGLEVEL", "INFO").upper(),
    stream=sys.stdout,
)
logger = logging.getLogger("unimol.inference")


def main(args):
    assert (
        args.batch_size is not None
    ), "Must specify batch size either with --batch-size"

    use_fp16 = args.fp16
    use_cuda = torch.cuda.is_available() and not args.cpu

    if use_cuda:
        torch.cuda.set_device(args.device_id)

    if args.distributed_world_size > 1:
        data_parallel_world_size = distributed_utils.get_data_parallel_world_size()
        data_parallel_rank = distributed_utils.get_data_parallel_rank()
    else:
        data_parallel_world_size = 1
        data_parallel_rank = 0

    # Load model
    # logger.info("loading model(s) from {}".format(args.path))
    state = checkpoint_utils.load_checkpoint_to_cpu(args.path)
    task = tasks.setup_task(args)
    model = task.build_model(args)
    model.load_state_dict(state["model"], strict=False)

    # Move models to GPU
    if use_fp16:
        model.half()
    if use_cuda:
        model.cuda()

    # Print args
    # logger.info(args)

    # Build loss
    loss = task.build_loss(args)
    loss.eval()

    for subset in args.valid_subset.split(","):
        try:
            task.load_dataset(subset, combine=False, epoch=1)
            dataset = task.dataset(subset)
            # logger.info(dataset)
        except KeyError:
            raise Exception("Cannot find dataset: " + subset)

        if not os.path.exists(args.results_path):
            os.makedirs(args.results_path)
            
        fname = (args.path).split("/")[-2]
        save_path = os.path.join(args.results_path, fname + "_" + subset + ".out.pkl")
        
        # Initialize data iterator
        itr = task.get_batch_iterator(
            dataset=dataset,
            batch_size=args.batch_size,
            ignore_invalid_inputs=True,
            required_batch_size_multiple=args.required_batch_size_multiple,
            seed=args.seed,
            num_shards=data_parallel_world_size,
            shard_id=data_parallel_rank,
            num_workers=args.num_workers,
            data_buffer_size=args.data_buffer_size,
        ).next_epoch_itr(shuffle=False)

        progress = progress_bar.progress_bar(
            itr,
            log_format=args.log_format,
            log_interval=args.log_interval,
            prefix=f"valid on '{subset}' subset",
            default_log_format=("tqdm" if not args.no_progress_bar else "simple"),
        )

        log_outputs = []

        data_metainfo = {
        "mean": [3.218297222, 3.689759105, 3.217428858, 
                 -1.752622865, -5.061926358],
        "std": [0.226148499, 0.282869479, 0.227074731,
                0.370901885, 0.331173442],
        "target_name": ["ES1", "ES2", "ET1","LUMO","HOMO"],
    }
        
        for i, sample in enumerate(progress):
            sample = utils.move_to_cuda(sample) if use_cuda else sample
            if len(sample) == 0:
                continue
            model.eval()
            with torch.no_grad():
                net_output = model(
            **sample["net_input"],
            features_only=True,
            classification_head_name=args.classification_head_name,
        )
            reg_output = net_output[0]
            targets_mean = torch.tensor(data_metainfo["mean"], device=reg_output.device)
            targets_std = torch.tensor(data_metainfo["std"], device=reg_output.device)
            reg_output = reg_output * targets_std + targets_mean
            logging_output = {
                "predict": reg_output.view(-1, args.num_classes).data,
                "smi_name": sample["smi_name"],
                "num_task": args.num_classes,
                "conf_size":args.conf_size,
                "bsz": sample["target"]["finetune_target"].size(0),
            }
            progress.log({}, step=i)
            log_outputs.append(logging_output)
            
        pickle.dump(log_outputs, open(save_path, "wb"))
        logger.info("Done inference! ")
    return None


def cli_main():
    parser = options.get_validation_parser()
    options.add_model_args(parser)
    args = options.parse_args_and_arch(parser)

    distributed_utils.call_main(args, main)


if __name__ == "__main__":
    cli_main()
