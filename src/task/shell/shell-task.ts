import * as thl_fs from '../../fs';
import * as thl_process from '../../process';
import * as thl_task from '..';
import * as thl_text from '../../text';
import * as thl_util from '../../util';

export class ShellTask extends thl_task.Task<ShellTask.Options, ShellTask.Data> {
  constructor(options: ShellTask.Options) {
    super(options, thl_task.Task.filterArray(thl_util.ensureArray(options.input ?? options.inputs)));
  }

  public override prepare(): ShellTask.Data {
    const options = this.options;
    const inputs = thl_task.FilesProvider.toPaths(thl_util.ensureArray(options.input ?? options.inputs));
    const outputs = thl_task.BuildDir.asBuildPathArray(thl_util.ensureArray(options.output ?? options.outputs));
    const lastCommand = new thl_util.PersistentData(outputs[0].append('.cmd'));
    const substitutions = {
      ...this.generateSubstitutions('input', inputs),
      ...this.generateSubstitutions('output', outputs),
      ...options.substitutions,
    };
    const commands = options.commands.map(command => thl_text.expandTemplate(command, substitutions));

    return {
      commands,
      inputs,
      lastCommand,
      outputs,
    };
  }

  public override needToRun(data: ShellTask.Data): boolean {
    if (this.options.needToRun) {
      const needToRun = this.options.needToRun(data.inputs, data.outputs);

      if (needToRun !== undefined) {
        return needToRun;
      }
    }

    if (data.inputs.length === 0 || data.outputs.length === 0) {
      return true;
    }

    if (data.lastCommand.get() !== data.commands.join('\n')) {
      return true;
    }

    return thl_fs.file.isNewer(data.inputs, data.outputs);
  }

  public override async run(data: ShellTask.Data, taskRunnerOptions?: thl_task.TaskRunner.Options): Promise<void> {
    for (const output of data.outputs) {
      thl_fs.dir.createForFile(output);
    }

    for (const command of data.commands) {
      await thl_process.executeAsync(command, {
        echoCommand: this.options.echoCommand ?? !!taskRunnerOptions?.debug,
      });
    }

    data.lastCommand.set(data.commands.join('\n'));
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
    input?: thl_task.FilesProviderlike;
    inputs?: thl_task.FilesProviderlike[];
    needToRun?: (inputs: thl_fs.Path[], outputs: thl_fs.Path[]) => boolean | undefined;
    output?: thl_fs.Pathlike;
    outputs?: thl_fs.Pathlike[];
    substitutions?: Record<string, unknown>;
  }

  export interface Data extends thl_task.FilesProvider {
    commands: string[];
    inputs: thl_fs.Path[];
    lastCommand: thl_util.PersistentData;
  }
}
