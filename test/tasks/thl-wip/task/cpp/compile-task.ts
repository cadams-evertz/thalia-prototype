import * as thl from 'thalia';

import { Task as thl_task_cpp_Task } from './task';

export class CompileTask extends thl_task_cpp_Task {
  public get options(): CompileTask.Options {
    return this.baseOptions as CompileTask.Options;
  }

  constructor(options: CompileTask.Options) {
    super({
      ...options,
      inputs: [options.source],
      outputs: [`${options.source}.o`],
      command: `g++ {{includes}} {{defines}} -c {{inputs}} -o {{outputs}}`,
    });
  }
}

export namespace CompileTask {
  export interface Options extends Omit<thl_task_cpp_Task.Options, 'command' | 'inputs' | 'outputs'> {
    source: thl.fs.Pathlike;
  }
}
