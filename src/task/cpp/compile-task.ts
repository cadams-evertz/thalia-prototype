import * as thl_fs from '../../fs';
import * as thl_task from '..';

import { StaticLibTask } from './static-lib-task';
import { Task } from './task';

// @ts-ignore - `ensure()` override
export class CompileTask extends Task {
  private readonly source: thl_task.FileProviderTask;
  private readonly obj: thl_fs.Path;
  private readonly libs: StaticLibTask[];

  constructor(options: CompileTask.Options) {
    const source = thl_task.FileProviderTask.ensure(options.source);
    const obj = thl_task.BuildDir.asBuildPath(
      source.file.append(options.variant ? `${options.variant.suffix}.o` : '.o'),
    );
    const libs = options.libs ?? [];
    const combinedOptions = Task.Options.combine(options, libs);
    super({
      ...combinedOptions,
      description: options.variant
        ? `Compiling ${source.file} (${options.variant.name})...`
        : `Compiling ${source.file}...`,
      inputs: [source],
      outputs: [obj],
      command: `g++ {{flags}} {{includes}} {{defines}} -c {{source}} -o {{obj}}`,
      substitutions: {
        source: source.files,
        obj,
      },
    });
    this.source = source;
    this.obj = obj;
    this.libs = libs;
  }

  public override createVariant(variantOptions: Task.VariantOptions): CompileTask {
    const options = this.options;
    return new CompileTask({
      ...options,
      source: this.source,
      libs: this.libs.map(lib => lib.createVariant(variantOptions)),
      flags: [...variantOptions.flags, ...(options.flags ?? [])],
      variant: variantOptions.variant,
    });
  }

  public override createVariants(variantOptions: Task.VariantOptions[]): CompileTask[] {
    return variantOptions.map(item => this.createVariant(item));
  }

  public static ensure(value: CompileTasklike, options: Omit<CompileTask.Options, 'source'>): CompileTask {
    return CompileTask.is(value) ? value : new CompileTask({ ...options, source: value });
  }

  public static ensureArray(values: CompileTasklike[], options: Omit<CompileTask.Options, 'source'>): CompileTask[] {
    return values.map(value => CompileTask.ensure(value, options));
  }

  public static is(value: unknown): value is CompileTask {
    return value instanceof CompileTask;
  }
}

export namespace CompileTask {
  export interface Options extends Omit<Task.Options, 'command' | 'description' | 'inputs' | 'outputs'> {
    source: thl_task.FileProviderTasklike;
    libs?: StaticLibTask[];
  }
}

export type CompileTasklike = thl_task.FileProviderTasklike | CompileTask;
