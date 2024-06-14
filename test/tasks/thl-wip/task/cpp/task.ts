import * as thl from 'thalia';

export class Task extends thl.task.ChildProcessTask {
  private readonly defines: string[];
  private readonly includeDirs: thl.fs.Path[];

  constructor(options: Task.Options) {
    super({
      ...options,
      substitutions: {
        defines: options.defines?.map(define => `-D${define}`),
        includes: options.includeDirs?.map(includeDir => `-I${thl.fs.Path.ensure(includeDir)}`),
        ...options.substitutions,
      },
    });
    this.defines = options.defines ?? [];
    this.includeDirs = thl.fs.Path.ensureArray(options.includeDirs ?? []);
    // this.libs = thl.fs.Path.ensureArray(options.libs ?? []);
  }
}

export namespace Task {
  export interface Options extends thl.task.ChildProcessTask.Options {
    defines?: string[];
    includeDirs?: thl.fs.Pathlike[];
    // libs?: thl.fs.Pathlike[];
  }
}
