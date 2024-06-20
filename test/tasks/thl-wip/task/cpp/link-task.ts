import * as thl from 'thalia';

import {
  CompileTask as thl_task_cpp_CompileTask,
  CompileTasklike as thl_task_cpp_CompileTasklike,
} from './compile-task';
import { Task as thl_task_cpp_Task } from './task';
import {
  StaticLibTask as thl_task_cpp_StaticLibTask,
  StaticLibTasklike as thl_task_cpp_StaticLibTasklike,
} from './static-lib-task';

export class LinkTask extends thl_task_cpp_Task {
  private readonly sources: thl_task_cpp_CompileTask[];
  private readonly exe: thl.fs.Path;
  private readonly libs: thl_task_cpp_StaticLibTask[];

  constructor(options: LinkTask.Options) {
    const sources = thl_task_cpp_CompileTask.ensureArray(options.sources, options);
    const exe = thl.fs.Path.ensure(options.exe);
    const libs = thl_task_cpp_StaticLibTask.ensureArray(options.libs ?? []);
    super({
      ...options,
      description: `Linking ${exe}...`,
      inputs: [...sources, ...libs],
      outputs: [exe],
      command: `g++ {{objs}} -o {{exe}} {{libs}}`,
      substitutions: {
        exe: exe,
        objs: sources.map(source => source.outputs).flat(),
        libs: libs.map(lib => lib.asCompilerOptions()),
      },
    });
    this.sources = sources;
    this.exe = exe;
    this.libs = libs;
  }
}

export namespace LinkTask {
  export interface Options extends Omit<thl_task_cpp_Task.Options, 'command' | 'description' | 'inputs' | 'outputs'> {
    sources: thl_task_cpp_CompileTasklike[];
    exe: thl.fs.Pathlike;
    libs?: thl_task_cpp_StaticLibTasklike[];
  }
}
