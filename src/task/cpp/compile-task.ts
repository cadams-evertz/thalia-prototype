import * as thl_fs from '../../fs';
import * as thl_task from '..';
import * as thl_util from '../../util';

import { CppTask } from './cpp-task';

export function compile(taskDir: string, options: thl_util.Resolvable<CompileTask.Options>): CompileTask {
  return thl_task.Task.create(taskDir, options, options => new CompileTask(options));
}

class CompileTask extends CppTask {
  public readonly obj: thl_fs.Path;
  public readonly source: thl_fs.Path;

  public override get outputs(): thl_fs.Path[] {
    return [this.obj];
  }

  constructor(options: CompileTask.Options) {
    const source = thl_task.FilesProvider.toPath(options.source);
    const obj = thl_task.BuildDir.asBuildPath(source.append('.o'));
    super(
      {
        ...options,
        dependencies: thl_task.Task.filterArray([options.source]),
        description: options.description ?? `Compiling ${source}...`,
      },
      new thl_util.PersistentData(obj.append('.cmd')),
    );
    this.obj = obj;
    this.source = source;
    this.setCommand(`g++ {{compileFlags}} {{includes}} {{defines}} -c ${source} -o ${obj}`);
  }

  public override needToRun(): boolean {
    return super.needToRun() || thl_fs.file.isNewer(this.source, this.obj);
  }

  public override async run(taskRunnerOptions?: thl_task.TaskRunner.Options): Promise<void> {
    thl_fs.dir.createForFile(this.obj);
    await super.run(taskRunnerOptions);
  }
}

namespace CompileTask {
  export interface Options extends CppTask.Options {
    source: thl_task.FilesProviderlike;
  }
}

export type CompileTasklike = thl_task.FilesProviderlike | CompileTask;

export namespace CompileTasklike {
  export function asCompileTask(value: CompileTasklike, options: Omit<CompileTask.Options, 'source'>): CompileTask {
    return value instanceof CompileTask ? value : new CompileTask({ ...options, source: value });
  }

  export function asCompileTaskArray(
    values: CompileTasklike[],
    options: Omit<CompileTask.Options, 'source'>,
  ): CompileTask[] {
    return values.map(value => CompileTasklike.asCompileTask(value, options));
  }
}
