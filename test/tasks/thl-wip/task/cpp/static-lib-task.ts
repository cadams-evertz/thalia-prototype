import * as thl from 'thalia';

import {
  CompileTask as thl_task_cpp_CompileTask,
  CompileTasklike as thl_task_cpp_CompileTasklike,
} from './compile-task';
import { Task as thl_task_cpp_Task } from './task';

export class StaticLibTask extends thl_task_cpp_Task {
  private readonly sources: thl_task_cpp_CompileTask[];
  private readonly lib: thl.fs.Path;

  constructor(options: StaticLibTask.Options) {
    const sources = thl_task_cpp_CompileTask.ensureArray(options.sources ?? [], options);
    const lib = thl.fs.Path.ensure(options.lib);
    super({
      ...options,
      description: sources.length > 0 ? `Creating ${lib}...` : lib.absolute(),
      inputs: sources,
      outputs: [lib],
      command: `ar rs {{lib}} {{objs}}`,
      substitutions: {
        lib,
        objs: sources.map(source => source.outputs).flat(),
      },
    });
    this.sources = sources;
    this.lib = lib;
  }

  public asCompilerOptions(): string {
    return `-L${this.lib.dirPath().absolute()} -l${this.lib.basename('.a').slice(3)}`;
  }
}

export namespace StaticLibTask {
  export interface Options extends Omit<thl_task_cpp_Task.Options, 'command' | 'description' | 'inputs' | 'outputs'> {
    sources?: thl_task_cpp_CompileTasklike[];
    lib: thl.fs.Pathlike;
  }
}
