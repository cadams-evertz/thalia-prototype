import * as thl_fs from '../../fs';
import * as thl_process from '../../process';
import * as thl_task from '..';
import * as thl_util from '../../util';

export class ShellTask extends thl_task.FilesProviderTask<ShellTask.Options> {
  private inputs: thl_fs.Path[] = [];

  constructor(options: ShellTask.Options) {
    const dependencies = thl_task.Task.filterArray(thl_util.ensureArray(options.input ?? options.inputs));
    super(options, dependencies);
    this.outputs = thl_task.BuildDir.asBuildPathArray(thl_util.ensureArray(options.output ?? options.outputs));
  }

  protected override prepare(): void {
    this.inputs = thl_task.FilesProviderTask.toPaths(thl_util.ensureArray(this.options.input ?? this.options.inputs));
  }

  protected override needToRun(): boolean {
    return this.inputs.length === 0 || this.outputs.length === 0
      ? true
      : thl_fs.file.isNewer(this.inputs, this.outputs);
  }

  protected override async run(taskRunnerOptions?: thl_task.TaskRunner.Options): Promise<void> {
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
  export interface Options extends thl_task.Task.Options {
    commands: string[];
    input?: thl_task.FilesProviderTasklike;
    inputs?: thl_task.FilesProviderTasklike[];
    output?: thl_fs.Pathlike;
    outputs?: thl_fs.Pathlike[];
  }
}
