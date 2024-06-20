import * as thl from 'thalia';

import { determineDeps } from './determine-deps';

export abstract class Task extends thl.task.ChildProcessTask {
  public readonly defines: string[];
  public readonly flags: string[];
  public readonly includeDirs: thl.fs.Path[];

  protected get options(): Task.Options {
    return {
      alwaysRun: this.alwaysRun,
      command: this.command,
      defines: this.defines,
      dependencies: this.dependencies,
      description: this.description,
      echoCommand: this.echoCommand,
      flags: this.flags,
      includeDirs: this.includeDirs,
      substitutions: this.substitutions,
    };
  }

  constructor(options: Task.Options) {
    const defines = options.defines ?? [];
    const flags = options.flags ?? [];
    const includeDirs = thl.fs.Path.ensureArray(options.includeDirs ?? []);
    const defineFlags = defines.map(define => `-D${define}`);
    const includeFlags = includeDirs.map(includeDir => `-I${includeDir}`);
    const innerDeps = determineDeps(
      thl.task.FileProviderTask.ensureArray(options.inputs)
        .map(task => task.files)
        .flat(),
      [...defineFlags, ...includeFlags],
    );
    super({
      ...options,
      inputs: [...options.inputs, ...innerDeps],
      substitutions: {
        defines: defineFlags,
        flags,
        includes: includeFlags,
        ...options.substitutions,
      },
    });
    this.defines = defines;
    this.flags = flags;
    this.includeDirs = includeDirs;
  }

  public abstract createVariant(variantOptions: Task.VariantOptions): Task;
  public abstract createVariants(variantOptions: Task.VariantOptions[]): Task[];
}

export namespace Task {
  export interface Options extends thl.task.ChildProcessTask.Options {
    defines?: string[];
    flags?: string[];
    includeDirs?: thl.fs.Pathlike[];
    variant?: Variant;
  }

  export namespace Options {
    export function combine(
      options: {
        defines?: string[];
        includeDirs?: thl.fs.Pathlike[];
      },
      tasks: Task[],
    ): {
      defines?: string[];
      includeDirs?: thl.fs.Pathlike[];
    } {
      return tasks.reduce((combinedOptions, task) => {
        return {
          ...combinedOptions,
          defines: thl.util.unique([...(combinedOptions.defines ?? []), ...task.defines]),
          includeDirs: thl.util.unique([...(combinedOptions.includeDirs ?? []), ...task.includeDirs]),
        };
      }, options);
    }
  }

  export interface Variant {
    name: string;
    suffix: string;
  }

  export interface VariantOptions {
    variant: Variant;
    flags: string[];
  }
}
