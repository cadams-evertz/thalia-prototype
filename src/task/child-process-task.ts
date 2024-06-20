import * as thl_fs from '../fs';
import * as thl_process from '../process';
import * as thl_text from '../text';

import { FileProviderTask, FileProviderTasklike } from './file-provider-task';

export class ChildProcessTask extends FileProviderTask {
  public readonly outputs: thl_fs.Path[];

  protected readonly alwaysRun: boolean;
  protected readonly command: string;
  protected readonly echoCommand: boolean;
  protected readonly inputs: FileProviderTask[];
  protected readonly substitutions: Record<string, unknown>;

  constructor(options: ChildProcessTask.Options) {
    const inputs = (options.inputs ?? []).map(input => FileProviderTask.ensure(input));
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
      inputs: allInputs.map(input => (FileProviderTask.is(input) ? input.files : input)).flat(),
      outputs: this.outputs,
      ...this.substitutions,
    };
    let command = thl_text.expandTemplate(this.command, substitutions);

    while (true) {
      const commandLen = command.length;
      command = command.replace(/  /g, ' ');

      if (commandLen === command.length) {
        break;
      }
    }

    this.logDescription();
    await thl_process.executeAsync(command, { echoCommand: this.echoCommand });
  }
}

export namespace ChildProcessTask {
  export interface Options extends Omit<FileProviderTask.Options, 'files'> {
    alwaysRun?: boolean;
    command: string;
    echoCommand?: boolean;
    inputs?: FileProviderTasklike[];
    outputs?: thl_fs.Pathlike[];
    substitutions?: Record<string, unknown>;
  }
}
