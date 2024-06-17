import * as thl from 'thalia';

import {
  StaticLibTask as thl_task_cpp_StaticLibTask,
  StaticLibTasklike as thl_task_cpp_StaticLibTasklike,
} from './static-lib-task';
import { Task as thl_task_cpp_Task } from './task';

// @ts-ignore - `ensure()` override
export class CompileTask extends thl_task_cpp_Task {
  private readonly source: thl.task.FileProviderTask;
  private readonly obj: thl.fs.Path;
  private readonly libs: thl_task_cpp_StaticLibTask[];

  constructor(options: CompileTask.Options) {
    const source = thl.task.FileProviderTask.ensure(options.source);
    const obj = source.file.append('.o');
    const libs = thl_task_cpp_StaticLibTask.ensureArray(options.libs ?? []);
    super({
      ...options,
      description: `Compiling ${source.file}...`,
      inputs: [source],
      outputs: [obj],
      command: `g++ {{includes}} {{defines}} -c {{source}} -o {{obj}}`,
      substitutions: {
        source: source.files,
        obj,
      },
    });
    this.source = source;
    this.obj = obj;
    this.libs = libs;
  }

  public static ensure(value: CompileTasklike, options: Omit<CompileTask.Options, 'source'>): CompileTask {
    return CompileTask.is(value) ? value : new CompileTask({ ...options, source: value });
  }

  public static ensureArray(values: CompileTasklike[], options: Omit<CompileTask.Options, 'source'>): CompileTask[] {
    return values.map(value => CompileTask.ensure(value, options));
  }

  public static is(value: unknown): value is CompileTask {
    return value instanceof CompileTask;
  }

  public override repr(): thl.debug.Repr {
    return new thl.debug.Repr('cpp.CompileTask', { source: this.source.repr(), obj: this.obj.absolute() });
  }
}

export namespace CompileTask {
  export interface Options extends Omit<thl_task_cpp_Task.Options, 'command' | 'description' | 'inputs' | 'outputs'> {
    source: thl.task.FileProviderTasklike;
    libs?: thl_task_cpp_StaticLibTasklike[];
  }
}

export type CompileTasklike = thl.task.FileProviderTasklike | CompileTask;
