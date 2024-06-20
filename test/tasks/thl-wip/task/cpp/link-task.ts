import * as thl from 'thalia';

import {
  CompileTask as thl_task_cpp_CompileTask,
  CompileTasklike as thl_task_cpp_CompileTasklike,
} from './compile-task';
import { Task } from './task';
import { StaticLibTask } from './static-lib-task';

export class LinkTask extends Task {
  private readonly sources: thl_task_cpp_CompileTask[];
  private readonly exe: thl.fs.Path;
  private readonly libs: StaticLibTask[];

  constructor(options: LinkTask.Options) {
    const libs = options.libs ?? [];
    const combinedOptions = Task.Options.combine(options, libs);
    const sources = thl_task_cpp_CompileTask.ensureArray(options.sources, combinedOptions);
    const combinedOptions2 = Task.Options.combine(options, sources);
    const exe = thl.fs.Path.ensure(options.exe);
    super({
      ...combinedOptions2,
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
  export interface Options extends Omit<Task.Options, 'command' | 'description' | 'inputs' | 'outputs'> {
    sources: thl_task_cpp_CompileTasklike[];
    exe: thl.fs.Pathlike;
    libs?: StaticLibTask[];
  }
}
