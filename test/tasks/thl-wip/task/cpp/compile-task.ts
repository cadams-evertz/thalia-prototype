import * as thl from 'thalia';

import {
  StaticLibTask as thl_task_cpp_StaticLibTask,
  StaticLibTasklike as thl_task_cpp_StaticLibTasklike,
} from './static-lib-task';
import { Task as thl_task_cpp_Task } from './task';

export class CompileTask extends thl_task_cpp_Task {
  private readonly source: thl.fs.Path;
  private readonly obj: thl.fs.Path;
  private readonly libs: thl_task_cpp_StaticLibTask[];

  constructor(options: CompileTask.Options) {
    const source = thl.fs.Path.ensure(options.source);
    const obj = source.append('.o');
    const libs = thl_task_cpp_StaticLibTask.ensureArray(options.libs ?? []); //thl.fs.Path.ensureArray(options.libs ?? []);
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
    this.libs = libs;
  }

  public static ensure(value: CompileTasklike, options: Omit<CompileTask.Options, 'source'>): CompileTask {
    return CompileTask.is(value)
      ? value
      : thl.task.FileOutputTask.is(value)
      ? new CompileTask({ ...options, source: value.outputs[0] })
      : new CompileTask({ ...options, source: value });
  }

  public static ensureArray(values: CompileTasklike[], options: Omit<CompileTask.Options, 'source'>): CompileTask[] {
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
    libs?: thl_task_cpp_StaticLibTasklike[];
  }
}

export type CompileTasklike = thl.fs.Pathlike | thl.task.FileOutputTask | CompileTask;
