import * as thl_fs from '../fs';

import { Task as thl_task_Task } from './task';

export abstract class FileOutputTask extends thl_task_Task {
  public readonly outputs: thl_fs.Path[];

  constructor(options: FileOutputTask.Options) {
    super(options);
    this.outputs = thl_fs.Path.ensureArray(options.outputs ?? []);
  }

  public static is(value: unknown): value is FileOutputTask {
    return value instanceof FileOutputTask;
  }
}

export namespace FileOutputTask {
  export interface Options extends thl_task_Task.Options {
    outputs?: thl_fs.Pathlike[];
  }
}
