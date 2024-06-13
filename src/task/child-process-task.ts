import * as thl_fs from '../fs';
import * as thl_process from '../process';
import { FileOutputTask as thl_task_FileOutputTask } from './file-output-task';

export class ChildProcessTask extends thl_task_FileOutputTask {
  public get options(): ChildProcessTask.Options {
    return this._options as ChildProcessTask.Options;
  }

  constructor(options: ChildProcessTask.Options) {
    super({
      ...options,
      dependencies: [
        ...(options.dependencies ?? []),
        ...((options.inputs ?? []).filter(input => input instanceof ChildProcessTask) as ChildProcessTask[]),
      ],
    });
  }

  public override async run(): Promise<void> {
    const allInputs = this.options.inputs
      .map(input => (input instanceof thl_task_FileOutputTask ? input.options.outputs ?? [] : input))
      .flat();

    if (thl_fs.file.isNewer(allInputs, this.options.outputs)) {
      let command = this.options.command;

      if (allInputs) {
        command = command.replace(/\{\{inputs\}\}/g, allInputs.join(' '));
      }

      if (this.options.outputs) {
        command = command.replace(/\{\{outputs\}\}/g, this.options.outputs.join(' '));
      }

      await thl_process.executeAsync(command);
    }
  }
}

export namespace ChildProcessTask {
  export interface Options extends thl_task_FileOutputTask.Options {
    command: string;
    inputs?: Array<thl_fs.Pathlike | thl_task_FileOutputTask>;
  }
}
