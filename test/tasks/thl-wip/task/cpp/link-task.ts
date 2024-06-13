import * as thl from 'thalia';

import { CompileTask as thl_task_cpp_CompileTask } from './compile-task';
import { Task as thl_task_cpp_Task } from './task';
import { StaticLibTask as thl_task_cpp_StaticLibTask } from './static-lib-task';

export class LinkTask extends thl_task_cpp_Task {
  public get options(): LinkTask.Options {
    return this.baseOptions as LinkTask.Options;
  }

  constructor(options: LinkTask.Options) {
    const inputs = options.inputs.map(input =>
      input instanceof thl_task_cpp_Task ? input : new thl_task_cpp_CompileTask({ ...options, source: input }),
    );
    const nonLibInputs = inputs.filter(input => !(input instanceof thl_task_cpp_StaticLibTask));
    const libInputs = inputs.filter(input => input instanceof thl_task_cpp_StaticLibTask);
    super({
      ...options,
      inputs,
      outputs: [options.output],
      command: `g++ {{inputs}} -o {{outputs}} {{libs}}`,
      substitutions: {
        inputs: nonLibInputs,
        libs: libInputs.map(lib => lib.asCompilerOptions()),
      },
      // dependencies: [...(options.dependencies ?? []), ...libs],
    });
  }
}

export namespace LinkTask {
  export interface Options extends Omit<thl_task_cpp_Task.Options, 'command' | 'inputs' | 'outputs'> {
    inputs: Array<thl.fs.Pathlike | thl_task_cpp_Task>;
    output: thl.fs.Pathlike;
  }
}
