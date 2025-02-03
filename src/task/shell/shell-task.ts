import * as thl_fs from '../../fs';
import * as thl_process from '../../process';

import { BuildDir } from '../build-dir';
import { FilesProviderTask } from '../files-provider-task';
import { Task } from '../task';
import { TaskRunner } from '../task-runner';

export class ShellTask extends FilesProviderTask<ShellTask.Options> {
  private readonly _dependencies: Task[];
  public get dependencies(): Task[] {
    return this._dependencies;
  }

  private inputs: thl_fs.Path[] = [];

  constructor(options: ShellTask.Options) {
    super(options);
    this._dependencies = Task.filterArray(ShellTask.Options.getInputs(options));
  }

  protected override prepare(): void {
    this.inputs = FilesProviderTask.toPaths(ShellTask.Options.getInputs(this.options));
    this.outputs = BuildDir.asBuildPathArray(ShellTask.Options.getOutputs(this.options));
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

    for (const command of this.options.commands) {
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

  export namespace Options {
    export function getInputs(options: Options): (thl_fs.Pathlike | FilesProviderTask)[] {
      return options.input ? [options.input] : options.inputs ?? [];
    }

    export function getOutputs(options: Options): thl_fs.Pathlike[] {
      return options.output ? [options.output] : options.outputs ?? [];
    }
  }
}
