import * as thl from 'thalia';

export class Task extends thl.task.ChildProcessTask {
  public get options(): Task.Options {
    return this.baseOptions as Task.Options;
  }

  constructor(options: Task.Options) {
    super({
      ...options,
      substitutions: {
        defines: options.defines?.map(define => `-D${define}`),
        includes: options.includeDirs?.map(includeDir => `-I${thl.fs.Path.ensure(includeDir)}`),
        ...options.substitutions,
      },
    });
  }
}

export namespace Task {
  export interface Options extends thl.task.ChildProcessTask.Options {
    defines?: string[];
    includeDirs?: thl.fs.Pathlike[];
    libs?: thl.fs.Pathlike[];
  }
}
