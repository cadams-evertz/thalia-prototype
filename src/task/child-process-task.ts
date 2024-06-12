import { executeAsync as thl_process_executeAsync } from '../process';
import { Task as thl_task_Task } from './task';

export class ChildProcessTask extends thl_task_Task {
  constructor(private readonly command: string, dependencies: thl_task_Task[] = []) {
    super(dependencies);
  }

  public override async run(): Promise<void> {
    await thl_process_executeAsync(this.command);
  }
}
