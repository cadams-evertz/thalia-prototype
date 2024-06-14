import * as thl from 'thalia';

export class Task extends thl.task.ChildProcessTask {
  private readonly defines: string[];
  private readonly includeDirs: thl.fs.Path[];

  constructor(options: Task.Options) {
    const defines = options.defines ?? [];
    const includeDirs = thl.fs.Path.ensureArray(options.includeDirs ?? []);
    super({
      ...options,
      substitutions: {
        defines: defines.map(define => `-D${define}`),
        includes: includeDirs.map(includeDir => `-I${thl.fs.Path.ensure(includeDir)}`),
        ...options.substitutions,
      },
    });
    this.defines = defines;
    this.includeDirs = includeDirs;
  }
}

export namespace Task {
  export interface Options extends thl.task.ChildProcessTask.Options {
    defines?: string[];
    includeDirs?: thl.fs.Pathlike[];
  }
}
