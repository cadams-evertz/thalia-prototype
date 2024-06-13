import * as thl from 'thalia';

import { CompileTask as thl_task_cpp_CompileTask } from './compile-task';
import { Task as thl_task_cpp_Task } from './task';

export class StaticLibTask extends thl_task_cpp_Task {
  public get options(): StaticLibTask.Options {
    return this.baseOptions as StaticLibTask.Options;
  }

  constructor(options: StaticLibTask.Options) {
    super({
      ...options,
      inputs: options.inputs.map(input =>
        input instanceof thl_task_cpp_CompileTask ? input : new thl_task_cpp_CompileTask({ ...options, source: input }),
      ),
      outputs: [options.output],
      command: `ar rs {{outputs}} {{inputs}}`,
    });
  }

  public asCompilerOptions(): string {
    const output = thl.fs.Path.ensure(this.options.output);
    return `-L${output.dirPath().absolute()} -l${output.basename('.a').slice(3)}`;
  }
}

export namespace StaticLibTask {
  export interface Options extends Omit<thl_task_cpp_Task.Options, 'command' | 'inputs' | 'outputs'> {
    inputs: Array<thl.fs.Pathlike | thl_task_cpp_CompileTask>;
    output: thl.fs.Pathlike;
  }
}
