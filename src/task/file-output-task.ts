import * as thl_fs from '../fs';
import { Task as thl_task_Task } from './task';

export abstract class FileOutputTask extends thl_task_Task {
  public get options(): FileOutputTask.Options {
    return this.baseOptions as FileOutputTask.Options;
  }

  constructor(options: FileOutputTask.Options) {
    super(options);
  }

  public toString(): string {
    return this.options.outputs
      ? this.options.outputs.map(output => thl_fs.Path.ensure(output).absolute()).join(' ')
      : '';
  }
}

export namespace FileOutputTask {
  export interface Options extends thl_task_Task.Options {
    outputs?: thl_fs.Pathlike[];
  }
}
