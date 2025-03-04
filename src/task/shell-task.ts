import * as thl_fs from '../fs';
import * as thl_process from '../process';
import * as thl_text from '../text';
import * as thl_util from '../util';

import { BuildDir } from './build-dir';
import { FilesProvider, FilesProviderlike } from './files-provider';
import { Task } from './task';
import { TaskRunner } from './task-runner';

export function shell(taskDir: string, options: thl_util.Resolvable<ShellTask.Options>): ShellTask {
  return Task.create(taskDir, () => new ShellTask(options));
}

class ShellTask extends Task {
  public readonly commands: string[];
  public readonly echoCommand: boolean;
  public readonly inputs: thl_fs.Path[];
  public readonly lastCommand: thl_util.PersistentData;
  public readonly customNeedToRun?: (inputs: thl_fs.Path[], outputs: thl_fs.Path[]) => boolean | undefined;

  private readonly _outputs: thl_fs.Path[];
  public override get outputs(): thl_fs.Path[] {
    return this._outputs;
  }

  constructor(options: thl_util.Resolvable<ShellTask.Options>) {
    options = thl_util.Resolvable.resolve(options);
    const inputs = thl_util.ensureArray(options.input ?? options.inputs);
    const outputs = thl_util.ensureArray(options.output ?? options.outputs);
    super({ ...options, dependencies: [...(options.dependencies ?? []), ...Task.filterArray(inputs)] });
    this.echoCommand = !!options.echoCommand;
    this.inputs = FilesProvider.toPaths(inputs);
    this.customNeedToRun = options.needToRun;
    this._outputs = BuildDir.asBuildPathArray(outputs);
    this.lastCommand = new thl_util.PersistentData(this.outputs[0].append('.cmd'));

    const substitutions = {
      ...this.generateSubstitutions('input', this.inputs),
      ...this.generateSubstitutions('output', this.outputs),
      ...options.substitutions,
    };
    this.commands = options.commands.map(command => thl_text.expandTemplate(command, substitutions));
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

  public override needToRun(): boolean {
    if (this.customNeedToRun) {
      const needToRun = this.customNeedToRun(this.inputs, this.outputs);

      if (needToRun !== undefined) {
        return needToRun;
      }
    }

    if (this.areDependenciesNewerThanOutputs()) {
      return true;
    }

    if (this.inputs.length === 0 || this.outputs.length === 0) {
      return true;
    }

    if (this.lastCommand.get() !== this.commands.join('\n')) {
      return true;
    }

    return this.isNewerThanOutputs(this.inputs);
  }

  public override async run(taskRunnerOptions?: TaskRunner.Options): Promise<void> {
    for (const output of this.outputs) {
      thl_fs.dir.createForFile(output);
    }

    for (const command of this.commands) {
      await thl_process.executeAsync(command, {
        echoCommand: this.echoCommand ?? !!taskRunnerOptions?.debug,
      });
    }

    this.lastCommand.set(this.commands.join('\n'));
  }
}
namespace ShellTask {
  export interface Options extends Task.Options {
    commands: string[];
    echoCommand?: boolean;
    input?: FilesProviderlike;
    inputs?: FilesProviderlike[];
    needToRun?: (inputs: thl_fs.Path[], outputs: thl_fs.Path[]) => boolean | undefined;
    output?: thl_fs.Pathlike;
    outputs?: thl_fs.Pathlike[];
    substitutions?: Record<string, unknown>;
  }
}
