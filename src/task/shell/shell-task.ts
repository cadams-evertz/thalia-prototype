import * as thl_fs from '../../fs';
import * as thl_process from '../../process';
import * as thl_task from '..';
import * as thl_text from '../../text';
import * as thl_util from '../../util';

export class ShellTask extends thl_task.FilesProviderTask {
  private commands: string[] = [];
  private inputs: thl_fs.Path[] = [];
  private lastCommand: thl_util.PersistentData;

  constructor(protected readonly options: ShellTask.Options) {
    const dependencies = thl_task.Task.filterArray(thl_util.ensureArray(options.input ?? options.inputs));
    super(options, dependencies);
    this.outputs = thl_task.BuildDir.asBuildPathArray(thl_util.ensureArray(options.output ?? options.outputs));
    this.lastCommand = new thl_util.PersistentData(this.outputs[0].append('.cmd'));
  }

  protected override prepare(): void {
    this.inputs = thl_task.FilesProviderTask.toPaths(thl_util.ensureArray(this.options.input ?? this.options.inputs));

    const substitutions = {
      ...this.generateSubstitutions('input', this.inputs),
      ...this.generateSubstitutions('output', this.outputs),
      ...this.options.substitutions,
    };

    this.commands = this.options.commands.map(command => thl_text.expandTemplate(command, substitutions));
  }

  protected override needToRun(): boolean {
    if (this.options.needToRun) {
      const needToRun = this.options.needToRun(this.inputs, this.outputs);

      if (needToRun !== undefined) {
        return needToRun;
      }
    }

    if (this.inputs.length === 0 || this.outputs.length === 0) {
      return true;
    }

    if (this.lastCommand.get() !== this.commands.join('\n')) {
      return true;
    }

    return thl_fs.file.isNewer(this.inputs, this.outputs);
  }

  protected override async run(taskRunnerOptions?: thl_task.TaskRunner.Options): Promise<void> {
    for (const output of this.outputs) {
      thl_fs.dir.createForFile(output);
    }

    for (const command of this.commands) {
      await thl_process.executeAsync(command, {
        echoCommand: this.options.echoCommand ?? !!taskRunnerOptions?.debug,
      });
    }

    this.lastCommand.set(this.commands.join('\n'));
  }

  private generateSubstitutions(prefix: string, items: thl_fs.Path[]): Record<string, string> {
    return items.length === 0
      ? {
          [`${prefix}s`]: '',
        }
      : {
          [`${prefix}s`]: items.join(' '),
          [prefix]: items[0].absolute(),
          ...Object.fromEntries(items.map((item, index) => [`${prefix}${index}`, item.absolute()])),
        };
  }
}

export namespace ShellTask {
  export interface Options extends thl_task.Task.Options {
    commands: string[];
    echoCommand?: boolean;
    input?: thl_task.FilesProviderTasklike;
    inputs?: thl_task.FilesProviderTasklike[];
    needToRun?: (inputs: thl_fs.Path[], outputs: thl_fs.Path[]) => boolean | undefined;
    output?: thl_fs.Pathlike;
    outputs?: thl_fs.Pathlike[];
    substitutions?: Record<string, unknown>;
  }
}
