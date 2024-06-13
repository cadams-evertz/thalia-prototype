import * as thl_fs from '../fs';
import * as thl_process from '../process';
import * as thl_text from '../text';

import { FileOutputTask as thl_task_FileOutputTask } from './file-output-task';
import { Task as thl_task_Task } from './task';

export class ChildProcessTask extends thl_task_FileOutputTask {
  public override get dependencies(): thl_task_Task[] {
    return (this.options.inputs ?? []).filter(input => input instanceof thl_task_Task) as thl_task_Task[];
  }

  public get options(): ChildProcessTask.Options {
    return this.baseOptions as ChildProcessTask.Options;
  }

  constructor(options: ChildProcessTask.Options) {
    super(options);
  }

  public override async run(): Promise<void> {
    const allInputs = this.options.inputs
      .map(input => (input instanceof thl_task_FileOutputTask ? input.options.outputs ?? [] : input))
      .flat();

    if (!thl_fs.file.isNewer(allInputs, this.options.outputs)) {
      return;
    }

    const substitutions = {
      inputs: allInputs,
      outputs: this.options.outputs,
      ...this.options.substitutions,
    };
    const command = thl_text.expandTemplate(this.options.command, substitutions).replace(/  /g, ' ');

    await thl_process.executeAsync(command);
  }
}

export namespace ChildProcessTask {
  export interface Options extends thl_task_FileOutputTask.Options {
    command: string;
    inputs?: Array<thl_fs.Pathlike | thl_task_FileOutputTask>;
    substitutions?: Record<string, unknown>;
  }
}
