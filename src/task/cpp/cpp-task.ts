import * as thl_fs from '../../fs';
import * as thl_task from '..';

export abstract class CppTask<TOptions extends CppTask.Options, TData extends CppTask.Data> extends thl_task.Task<
  TOptions,
  TData
> {
  constructor(options: TOptions, dependencies: thl_task.Task[]) {
    super(options, dependencies);
  }

  protected prepareCommon(): {
    defineFlags: string;
    flags: string;
    includeDirs: thl_fs.Path[];
    includeFlags: string;
  } {
    const includeDirs = thl_fs.Path.ensureArray(this.options.includeDirs ?? []);
    const defineFlags = this.options.defines?.map(define => `-D${define}`).join(' ') ?? '';
    const includeFlags = includeDirs.map(includeDir => `-I${includeDir}`).join(' ') ?? '';
    const flags = this.options.flags?.join(' ') ?? '';

    return {
      defineFlags,
      flags,
      includeDirs,
      includeFlags,
    };
  }
}

export namespace CppTask {
  export interface Options extends thl_task.Task.Options {
    defines?: string[];
    flags?: string[];
    includeDirs?: thl_fs.Pathlike[];
  }

  export interface Data {
  }
}
