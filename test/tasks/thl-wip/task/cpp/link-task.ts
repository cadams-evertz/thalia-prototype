import * as thl from 'thalia';

import { CompileTask as thl_task_cpp_CompileTask } from './compile-task';
import { Task as thl_task_cpp_Task } from './task';
import { StaticLibTask as thl_task_cpp_StaticLibTask } from './static-lib-task';

export class LinkTask extends thl_task_cpp_Task {
  private readonly sources: thl_task_cpp_CompileTask[];
  private readonly exe: thl.fs.Path;
  private readonly libs: thl_task_cpp_StaticLibTask[];

  constructor(options: LinkTask.Options) {
    const sources = thl_task_cpp_CompileTask.ensureArray(options.sources, options);
    const exe = thl.fs.Path.ensure(options.exe);
    const libs = options.libs ?? [];
    super({
      ...options,
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

  public override repr(): thl.debug.Repr {
    return new thl.debug.Repr('cpp.LinkTask', {
      exe: this.exe.absolute(),
      libs: this.libs,
      sources: this.sources,
    });
  }
}

export namespace LinkTask {
  export interface Options extends Omit<thl_task_cpp_Task.Options, 'command' | 'inputs' | 'outputs'> {
    sources: Array<thl.fs.Pathlike | thl_task_cpp_CompileTask>; // | thl_task_cpp_Task>;
    exe: thl.fs.Pathlike;
    libs?: thl_task_cpp_StaticLibTask[];
  }
}
