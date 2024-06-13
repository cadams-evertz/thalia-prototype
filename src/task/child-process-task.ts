import { executeAsync as thl_process_executeAsync } from '../process';
import { Task as thl_task_Task } from './task';

export class ChildProcessTask extends thl_task_Task {
  constructor(public readonly options: ChildProcessTask.Options) {
    super(options);
  }

  public override async run(): Promise<void> {
    await thl_process_executeAsync(this.options.command);
  }
}

export namespace ChildProcessTask {
  export interface Options extends thl_task_Task.Options {
    command: string;
  }
}
