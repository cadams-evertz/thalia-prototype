import * as thl_fs from '../fs';
import { Task as thl_task_Task } from './task';

export abstract class FileOutputTask extends thl_task_Task {
  public get options(): FileOutputTask.Options {
    return this._options as FileOutputTask.Options;
  }

  constructor(options: FileOutputTask.Options) {
    super(options);
  }
}

export namespace FileOutputTask {
  export interface Options extends thl_task_Task.Options {
    outputs?: thl_fs.Pathlike[];
  }
}
