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

# logging.basicConfig(
#     format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
#     datefmt="%Y-%m-%d %H:%M:%S",
#     level=os.environ.get("LOGLEVEL", "INFO").upper(),
#     stream=sys.stdout,
# )
# logger = logging.getLogger("unimol.inference")


def main(args):
    '''
    首先，代码使用断言(assert)语句检查是否已经指定了批处理大小(args.batch_size)，如果没有，则会抛出一个错误信息。
    '''
    assert (
        args.batch_size is not None
    ), "Must specify batch size either with --batch-size"
    '''
    代码检查是否可以使用GPU进行计算，并设置使用的GPU设备。如果args.cpu为True，表示不使用GPU，
    则使用torch.cuda.is_available()函数判断是否有可用的GPU，并使用torch.cuda.set_device()函数设置使用的GPU设备
    '''
    use_fp16 = args.fp16
    use_cuda = torch.cuda.is_available() and not args.cpu

    if use_cuda:
        torch.cuda.set_device(args.device_id)
    '''
    代码根据args.distributed_world_size的值，判断是否在分布式环境下进行训练。如果args.distributed_world_size大于1，
    表示在分布式环境下进行训练，通过distributed_utils模块获取分布式训练的world_size和rank，
    并分别赋值给data_parallel_world_size和data_parallel_rank。
    否则，将data_parallel_world_size和data_parallel_rank都设置为1和0，表示单机训练
    '''
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
    '''
    对于参数 args.valid_subset 中的每个子集（以逗号分隔的字符串），依次执行以下操作：
    a. 尝试加载数据集，其中使用了 task.load_dataset() 函数，参数 combine 设置为 False 表示不合并多个数据集，
        epoch 设置为 1 表示只加载第一个 epoch 的数据。
    b. 获取加载后的数据集对象，保存在 dataset 变量中。
    c. 如果数据集不存在（抛出 KeyError 异常），则抛出异常信息 "Cannot find dataset: " 后面加上数据集名称。
    '''
    for subset in args.valid_subset.split(","):
        try:
            task.load_dataset(subset, combine=False, epoch=1)
            dataset = task.dataset(subset)
        except KeyError:
            raise Exception("Cannot find dataset: " + subset)

        if not os.path.exists(args.results_path):
            os.makedirs(args.results_path)
        '''
        从参数 args.path 中提取文件夹的倒数第二级目录名称，并将其与当前处理的数据集名称 subset 以及固定的后缀 ".out.pkl" 拼接成保存结果的文件名 save_path。
        '''
        fname = (args.path).split("/")[-2]
        save_path = os.path.join(args.results_path, fname + "_" + subset + ".out.pkl")
        # Initialize data iterator
        '''
        初始化数据迭代器 itr，使用 task.get_batch_iterator() 函数从加载后的数据集 dataset 中获取批次迭代器，设置了一系列参数，
        包括批次大小、忽略无效输入、要求的批次大小的倍数、随机数种子、数据并行的世界大小和排名、工作进程数量、数据缓冲区大小等，
        并通过 next_epoch_itr() 函数将其设置为下一轮的迭代器，并设置 shuffle 参数为 False,表示不对数据进行洗牌。
        '''
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
        '''
        创建进度条对象 progress，使用 progress_bar.progress_bar() 函数，
        并设置了日志格式、日志间隔、前缀信息以及进度条的类型。
        '''
        progress = progress_bar.progress_bar(
            itr,
            log_format=args.log_format,
            log_interval=args.log_interval,
            prefix=f"valid on '{subset}' subset",
            default_log_format=("tqdm" if not args.no_progress_bar else "simple"),
        )
        '''
        初始化空的日志输出列表 'log_outputs'
        '''
        log_outputs = []
        
        '''
        对于 progress 迭代器中的每个样本（sample）：
        a. 如果使用 GPU 运算，则将样本移动到 GPU 上
        （使用 utils.move_to_cuda() 函数）。
        b. 如果样本的长度为 0，则跳过当前迭代。
        c. 调用 task.valid_step() 函数对样本进行验证步骤，包括模型推理、计算损失等，
        并将结果保存到变量 _、_ 和 log_output 中。
        d. 记录当前步骤的日志，并将 log_output 添加到日志输出列表 log_outputs 中。
        '''
        for i, sample in enumerate(progress):
            sample = utils.move_to_cuda(sample) if use_cuda else sample
            if len(sample) == 0:
                continue
            _, _, log_output = task.valid_step(sample, model, loss, test=True)
            progress.log({}, step=i)
            log_outputs.append(log_output)
        print(log_output['predict'])   
        '''
        将 log_outputs 使用 pickle 序列化，并保存到 save_path 文件中，
        文件以二进制写入模式打开。
        '''
        pickle.dump(log_outputs, open(save_path, "wb"))
        '''
        记录日志信息 "Done inference!"
        '''
        # logger.info("Done inference! ")
    return None


def cli_main():
    parser = options.get_validation_parser()
    options.add_model_args(parser)
    args = options.parse_args_and_arch(parser)

    distributed_utils.call_main(args, main)


if __name__ == "__main__":
    cli_main()
