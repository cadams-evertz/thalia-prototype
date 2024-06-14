import * as thl_debug from '../debug';
import * as thl_fs from '../fs';
import * as thl_process from '../process';
import * as thl_text from '../text';

import { FileOutputTask as thl_task_FileOutputTask } from './file-output-task';
import { Task as thl_task_Task } from './task';

export class ChildProcessTask extends thl_task_FileOutputTask {
  public override get dependencies(): thl_task_Task[] {
    return this.inputs.filter(thl_task_FileOutputTask.is);
  }

  private readonly inputs: Array<thl_fs.Path | thl_task_FileOutputTask>;
  private readonly substitutions: Record<string, unknown>;
  private readonly command: string;

  constructor(options: ChildProcessTask.Options) {
    super(options);
    this.inputs = (options.inputs ?? []).map(input =>
      thl_task_FileOutputTask.is(input) ? input : thl_fs.Path.ensure(input),
    );
    this.substitutions = options.substitutions ?? {};
    this.command = options.command;
  }

  public override async run(): Promise<void> {
    const allInputs = this.inputs.map(input => (thl_task_FileOutputTask.is(input) ? input.outputs : input)).flat();

    if (!thl_fs.file.isNewer(allInputs, this.outputs)) {
      return;
    }

    const substitutions = {
      inputs: allInputs,
      outputs: this.outputs,
      ...this.substitutions,
    };
    const command = thl_text.expandTemplate(this.command, substitutions).replace(/  /g, ' ');

    await thl_process.executeAsync(command);
  }

  public override repr(): thl_debug.Repr {
    return new thl_debug.Repr('ChildProcessTask', { inputs: this.inputs, outputs: this.outputs });
  }
}

export namespace ChildProcessTask {
  export interface Options extends thl_task_FileOutputTask.Options {
    command: string;
    inputs?: Array<thl_fs.Pathlike | thl_task_FileOutputTask>;
    substitutions?: Record<string, unknown>;
  }
}