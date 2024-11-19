import * as thl_fs from '../../fs';
import * as thl_task from '..';
import * as thl_util from '../../util';

import { determineDeps } from './determine-deps';

export abstract class Task extends thl_task.ChildProcessTask {
  public readonly defines: string[];
  public readonly flags: string[];
  public readonly includeDirs: thl_fs.Path[];

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
    const includeDirs = thl_fs.Path.ensureArray(options.includeDirs ?? []);
    const defineFlags = defines.map(define => `-D${define}`);
    const includeFlags = includeDirs.map(includeDir => `-I${includeDir}`);
    const inputs = options.inputs ?? [];
    const innerDeps = determineDeps(
      thl_task.FileProviderTask.ensureArray(inputs)
        .map(task => task.files)
        .flat(),
      [...defineFlags, ...includeFlags],
    );
    super({
      ...options,
      inputs: [...inputs, ...innerDeps],
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
  export interface Options extends thl_task.ChildProcessTask.Options {
    defines?: string[];
    flags?: string[];
    includeDirs?: thl_fs.Pathlike[];
    variant?: Variant;
  }

  export namespace Options {
    export function combine(
      options: {
        defines?: string[];
        includeDirs?: thl_fs.Pathlike[];
      },
      tasks: Task[],
    ): {
      defines?: string[];
      includeDirs?: thl_fs.Pathlike[];
    } {
      return tasks.reduce((combinedOptions, task) => {
        return {
          ...combinedOptions,
          defines: thl_util.unique([...(combinedOptions.defines ?? []), ...task.defines]),
          includeDirs: thl_util.unique([...(combinedOptions.includeDirs ?? []), ...task.includeDirs]),
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
