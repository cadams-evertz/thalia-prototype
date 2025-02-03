import * as thl_fs from '../../fs';
import * as thl_process from '../../process';

import { BuildDir } from '../build-dir';
import { FilesProviderTask } from '../files-provider-task';
import { Task } from '../task';
import { TaskRunner } from '../task-runner';

export class ShellTask extends FilesProviderTask {
  private readonly _dependencies: Task[];
  public get dependencies(): Task[] {
    return this._dependencies;
  }

  public readonly outputs: thl_fs.Path[];

  private readonly commands: string[];
  private readonly inputs: thl_fs.Path[];

  constructor(options: ShellTask.Options) {
    super(options);

    const inputs = options.input ? [options.input] : options.inputs ?? [];
    const outputs = options.output ? [options.output] : options.outputs ?? [];

    this.commands = options.commands;
    this.inputs = FilesProviderTask.toPaths(inputs);
    this.outputs = BuildDir.asBuildPathArray(outputs);
    this._dependencies = Task.filterArray(inputs);
  }

  protected override needToRun(): boolean {
    if (this.inputs.length === 0 || this.outputs.length === 0) {
      return true;
    } else {
      return thl_fs.file.isNewer(this.inputs, this.outputs);
    }
  }

  protected override async run(taskRunnerOptions?: TaskRunner.Options): Promise<void> {
    this.logDescription();

    for (const output of this.outputs) {
      thl_fs.dir.createForFile(output);
    }

    for (const command of this.commands) {
      const resolvedCommand = this.resolveCommand(
        this.resolveCommand(command, 'input', this.inputs),
        'output',
        this.outputs,
      );
      thl_process.execute(resolvedCommand, { echoCommand: !!taskRunnerOptions?.debug });
    }
  }

  private resolveCommand(command: string, prefix: string, items: thl_fs.Path[]): string {
    let resolvedCommand = command.replace(new RegExp(`\\{\\{${prefix}s\\}\\}`, 'g'), items.join(' '));

    if (items.length > 0) {
      resolvedCommand = resolvedCommand.replace(new RegExp(`\{\{${prefix}\}\}`, 'g'), items[0].absolute());

      for (let index = 0; index < items.length; index++) {
        resolvedCommand = resolvedCommand.replace(
          new RegExp(`\\{\\{${prefix}${index}\\}\\}`, 'g'),
          items[index].absolute(),
        );
      }
    }

    return resolvedCommand;
  }
}

export namespace ShellTask {
  export interface Options extends Task.Options {
    commands: string[];
    input?: thl_fs.Pathlike | FilesProviderTask;
    inputs?: (thl_fs.Pathlike | FilesProviderTask)[];
    output?: thl_fs.Pathlike;
    outputs?: thl_fs.Pathlike[];
  }
}
