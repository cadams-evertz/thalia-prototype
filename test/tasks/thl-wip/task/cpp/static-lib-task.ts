import * as thl from 'thalia';

import {
  CompileTask as thl_task_cpp_CompileTask,
  CompileTasklike as thl_task_cpp_CompileTasklike,
} from './compile-task';
import { Task as thl_task_cpp_Task } from './task';

export class StaticLibTask extends thl_task_cpp_Task {
  private readonly sources: thl_task_cpp_CompileTask[];
  private readonly lib: thl.fs.Path;
  private readonly libs: StaticLibTask[];

  constructor(options: StaticLibTask.Options) {
    const libs = options.libs ?? [];
    const combinedOptions = thl_task_cpp_Task.Options.combine(options, libs);
    const sources = thl_task_cpp_CompileTask.ensureArray(options.sources ?? [], combinedOptions);
    const lib = thl.fs.Path.ensure(options.lib);
    super({
      ...combinedOptions,
      description: sources.length > 0 ? `Creating ${lib}...` : lib.absolute(),
      inputs: [...sources, ...libs],
      outputs: [lib],
      command: `ar rs {{lib}} {{objs}}`,
      substitutions: {
        lib,
        objs: sources.map(source => source.outputs).flat(),
      },
    });
    this.sources = sources;
    this.lib = lib;
    this.libs = libs;
  }

  public asCompilerOptions(): string {
    return [
      `-L${this.lib.dirPath().absolute()} -l${this.lib.basename('.a').slice(3)}`,
      ...this.libs.map(lib => lib.asCompilerOptions()),
    ].join(' ');
  }
}

export namespace StaticLibTask {
  export interface Options extends Omit<thl_task_cpp_Task.Options, 'command' | 'description' | 'inputs' | 'outputs'> {
    sources?: thl_task_cpp_CompileTasklike[];
    lib: thl.fs.Pathlike;
    libs?: StaticLibTask[];
  }
}
