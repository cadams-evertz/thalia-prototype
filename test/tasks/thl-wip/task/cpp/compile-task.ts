import * as thl from 'thalia';

import { Task as thl_task_cpp_Task } from './task';

export class CompileTask extends thl_task_cpp_Task {
  private readonly source: thl.fs.Path;
  private readonly obj: thl.fs.Path;

  constructor(options: CompileTask.Options) {
    const source = thl.fs.Path.ensure(options.source);
    const obj = source.append('.o');
    super({
      ...options,
      description: `Compiling ${source}...`,
      inputs: [source],
      outputs: [obj],
      command: `g++ {{includes}} {{defines}} -c {{source}} -o {{obj}}`,
      substitutions: {
        source,
        obj,
      },
    });
    this.source = source;
    this.obj = obj;
  }

  public static ensure(
    value: thl.fs.Pathlike | CompileTask,
    options: Omit<CompileTask.Options, 'source'>,
  ): CompileTask {
    return CompileTask.is(value) ? value : new CompileTask({ ...options, source: value });
  }

  public static ensureArray(
    values: Array<thl.fs.Pathlike | CompileTask>,
    options: Omit<CompileTask.Options, 'source'>,
  ): CompileTask[] {
    return values.map(value => CompileTask.ensure(value, options));
  }

  public static is(value: unknown): value is CompileTask {
    return value instanceof CompileTask;
  }

  public override repr(): thl.debug.Repr {
    return new thl.debug.Repr('cpp.CompileTask', { source: this.source.absolute(), obj: this.obj.absolute() });
  }
}

export namespace CompileTask {
  export interface Options extends Omit<thl_task_cpp_Task.Options, 'command' | 'description' | 'inputs' | 'outputs'> {
    source: thl.fs.Pathlike;
  }
}
