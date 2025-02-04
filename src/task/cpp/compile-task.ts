import * as thl_fs from '../../fs';
import * as thl_process from '../../process';
import * as thl_task from '..';
import * as thl_util from '../../util';

import { CppTask } from './cpp-task';

export class CompileTask extends CppTask<CompileTask.Options, CompileTask.Data> {
  constructor(options: CompileTask.Options) {
    super(
      {
        ...options,
        description: options.description ?? (() => `Compiling ${this.data?.source ?? this.options.source}...`),
      },
      thl_task.Task.filterArray([options.source]),
    );
  }

  public static ensure(value: CompileTasklike, options: Omit<CompileTask.Options, 'source'>): CompileTask {
    return value instanceof CompileTask ? value : new CompileTask({ ...options, source: value });
  }

  public static ensureArray(values: CompileTasklike[], options: Omit<CompileTask.Options, 'source'>): CompileTask[] {
    return values.map(value => CompileTask.ensure(value, options));
  }

  public override prepare(): CompileTask.Data {
    const { defineFlags, flags, includeFlags } = this.prepareCommon();
    const source = thl_task.FilesProvider.toPaths([this.options.source])[0];
    const obj = thl_task.BuildDir.asBuildPath(source.append('.o'));
    const lastCommand = new thl_util.PersistentData(obj.append('.cmd'));
    const command = `g++ ${flags} ${includeFlags} ${defineFlags} -c ${source} -o ${obj}`.replace(/  /g, ' ');

    return { source, obj, command, lastCommand };
  }

  public override needToRun(data: CompileTask.Data): boolean {
    return data.lastCommand.get() !== data.command || thl_fs.file.isNewer(data.source, data.obj);
  }

  public override async run(data: CompileTask.Data, taskRunnerOptions?: thl_task.TaskRunner.Options): Promise<void> {
    thl_fs.dir.createForFile(data.obj);
    await thl_process.executeAsync(data.command);
    data.lastCommand.set(data.command);
  }
}

export namespace CompileTask {
  export interface Options extends CppTask.Options {
    source: thl_task.FilesProviderlike;
  }

  export interface Data extends CppTask.Data {
    source: thl_fs.Path;
    obj: thl_fs.Path;
    command: string;
    lastCommand: thl_util.PersistentData;
  }
}

export type CompileTasklike = thl_task.FilesProviderlike | CompileTask;
