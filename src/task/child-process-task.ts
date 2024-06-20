import * as thl_debug from '../debug';
import * as thl_fs from '../fs';
import * as thl_process from '../process';
import * as thl_text from '../text';

import {
  FileProviderTask as thl_task_FileProviderTask,
  FileProviderTasklike as thl_task_FileProviderTasklike,
} from './file-provider-task';

export class ChildProcessTask extends thl_task_FileProviderTask {
  public readonly outputs: thl_fs.Path[];

  private readonly alwaysRun: boolean;
  private readonly command: string;
  private readonly echoCommand: boolean;
  private readonly inputs: thl_task_FileProviderTask[];
  private readonly substitutions: Record<string, unknown>;

  constructor(options: ChildProcessTask.Options) {
    const inputs = (options.inputs ?? []).map(input => thl_task_FileProviderTask.ensure(input));
    const outputs = (options.outputs ?? []).map(output => thl_fs.Path.ensure(output));
    super({
      ...options,
      dependencies: inputs,
      files: outputs,
    });
    this.alwaysRun = !!options.alwaysRun;
    this.command = options.command;
    this.echoCommand = options.echoCommand ?? false;
    this.inputs = inputs;
    this.outputs = outputs;
    this.substitutions = options.substitutions ?? {};
  }

  public override async run(): Promise<void> {
    const allInputs = this.inputs.map(input => input.files).flat();

    if (!this.alwaysRun && !thl_fs.file.isNewer(allInputs, this.outputs)) {
      return;
    }

    const substitutions = {
      inputs: allInputs.map(input => (thl_task_FileProviderTask.is(input) ? input.files : input)).flat(),
      outputs: this.outputs,
      ...this.substitutions,
    };
    const command = thl_text.expandTemplate(this.command, substitutions).replace(/  /g, ' ');

    this.logDescription();
    await thl_process.executeAsync(command, { echoCommand: this.echoCommand });
  }
}

export namespace ChildProcessTask {
  export interface Options extends Omit<thl_task_FileProviderTask.Options, 'files'> {
    alwaysRun?: boolean;
    command: string;
    echoCommand?: boolean;
    inputs?: thl_task_FileProviderTasklike[];
    outputs?: thl_fs.Pathlike[];
    substitutions?: Record<string, unknown>;
  }
}
