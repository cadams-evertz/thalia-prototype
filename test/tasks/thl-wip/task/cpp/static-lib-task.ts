import * as thl from 'thalia';

import { CompileTask, CompileTasklike } from './compile-task';
import { Task } from './task';

export class StaticLibTask extends Task {
  private readonly sources: CompileTask[];
  private readonly lib: thl.fs.Path;
  private readonly libs: StaticLibTask[];

  constructor(options: StaticLibTask.Options) {
    const libs = options.libs ?? [];
    const combinedOptions = Task.Options.combine(options, libs);
    const sources = CompileTask.ensureArray(options.sources ?? [], combinedOptions);
    const combinedOptions2 = Task.Options.combine(options, sources);
    let lib = thl.task.BuildDir.asBuildPath(options.lib);
    if (options.variant) {
      lib = lib.changeExtension(`${options.variant.suffix}.a`);
    }
    super({
      ...combinedOptions2,
      description:
        sources.length === 0
          ? lib.absolute()
          : options.variant
          ? `Creating ${lib} (${options.variant.name})...`
          : `Creating ${lib}...`,
      inputs: [...sources, ...libs],
      outputs: [lib],
      command: `ar rs {{lib}} {{objs}}`,
      substitutions: {
        lib,
        objs: sources.map(source => source.outputs).flat(),
      },
    });
    this.sources = sources;
    this.lib = lib;
    this.libs = libs;
  }

  public asCompilerOptions(): string {
    return [
      `-L${this.lib.dirPath().absolute()} -l${this.lib.basename('.a').slice(3)}`,
      ...this.libs.map(lib => lib.asCompilerOptions()),
    ].join(' ');
  }

  public override createVariant(variantOptions: Task.VariantOptions): StaticLibTask {
    const options = this.options;
    return new StaticLibTask({
      ...options,
      sources: this.sources.map(source => source.createVariant(variantOptions)),
      lib: this.lib,
      libs: this.libs.map(lib => lib.createVariant(variantOptions)),
      flags: [...variantOptions.flags, ...options.flags],
      variant: variantOptions.variant,
    });
  }

  public override createVariants(variantOptions: Task.VariantOptions[]): StaticLibTask[] {
    return variantOptions.map(item => this.createVariant(item));
  }
}

export namespace StaticLibTask {
  export interface Options extends Omit<Task.Options, 'command' | 'description' | 'inputs' | 'outputs'> {
    sources?: CompileTasklike[];
    lib: thl.fs.Pathlike;
    libs?: StaticLibTask[];
  }
}
