import * as thl_debug from '../debug';
import * as thl_fs from '../fs';
import * as thl_process from '../process';
import * as thl_text from '../text';

import { FileOutputTask as thl_task_FileOutputTask } from './file-output-task';
import { StaticFileTask as thl_task_StaticFileTask } from './static-file-task';
import { Task as thl_task_Task } from './task';

export class ChildProcessTask extends thl_task_FileOutputTask {
  public override get dependencies(): thl_task_Task[] {
    return this.inputs;
  }

  private readonly command: string;
  private readonly echoCommand: boolean;
  private readonly inputs: thl_task_FileOutputTask[];
  private readonly substitutions: Record<string, unknown>;

  constructor(options: ChildProcessTask.Options) {
    super(options);
    this.command = options.command;
    this.echoCommand = options.echoCommand ?? false;
    this.inputs = (options.inputs ?? []).map(input =>
      thl_task_FileOutputTask.is(input) ? input : new thl_task_StaticFileTask({ path: input }),
    );
    this.substitutions = options.substitutions ?? {};
  }

  public override async run(): Promise<void> {
    const allInputs = this.inputs.map(input => input.outputs).flat();

    if (!thl_fs.file.isNewer(allInputs, this.outputs)) {
      return;
    }

    const substitutions = {
      inputs: allInputs,
      outputs: this.outputs,
      ...this.substitutions,
    };
    const command = thl_text.expandTemplate(this.command, substitutions).replace(/  /g, ' ');

    this.logDescription();
    await thl_process.executeAsync(command, { echoCommand: this.echoCommand });
  }

  public override repr(): thl_debug.Repr {
    return new thl_debug.Repr('ChildProcessTask', { inputs: this.inputs, outputs: this.outputs });
  }
}

export namespace ChildProcessTask {
  export interface Options extends thl_task_FileOutputTask.Options {
    command: string;
    echoCommand?: boolean;
    inputs?: Array<thl_fs.Pathlike | thl_task_FileOutputTask>;
    substitutions?: Record<string, unknown>;
  }
}
