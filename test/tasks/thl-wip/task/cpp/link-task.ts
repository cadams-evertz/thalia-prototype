import * as thl from 'thalia';

import {
  CompileTask as thl_task_cpp_CompileTask,
  CompileTasklike as thl_task_cpp_CompileTasklike,
} from './compile-task';
import { Task } from './task';
import { StaticLibTask } from './static-lib-task';

export class LinkTask extends Task {
  private readonly sources: thl_task_cpp_CompileTask[];
  private readonly exe: thl.fs.Path;
  private readonly libs: StaticLibTask[];

  constructor(options: LinkTask.Options) {
    const libs = options.libs ?? [];
    const combinedOptions = Task.Options.combine(options, libs);
    const sources = thl_task_cpp_CompileTask.ensureArray(options.sources, combinedOptions);
    const combinedOptions2 = Task.Options.combine(options, sources);
    let exe = thl.fs.Path.ensure(options.exe);
    if (options.variant) {
      exe = exe.append(options.variant.suffix);
    }
    super({
      ...combinedOptions2,
      description: options.variant ? `Linking ${exe} (${options.variant.name})...` : `Linking ${exe}...`,
      inputs: [...sources, ...libs],
      outputs: [exe],
      command: `g++ {{flags}} {{objs}} -o {{exe}} {{libs}}`,
      substitutions: {
        exe: exe,
        objs: sources.map(source => source.outputs).flat(),
        libs: libs.map(lib => lib.asCompilerOptions()),
      },
    });
    this.sources = sources;
    this.exe = exe;
    this.libs = libs;
  }

  public override createVariant(variantOptions: Task.VariantOptions): LinkTask {
    const options = this.options;
    return new LinkTask({
      ...options,
      sources: this.sources.map(source => source.createVariant(variantOptions)),
      exe: this.exe,
      libs: this.libs.map(lib => lib.createVariant(variantOptions)),
      flags: [...variantOptions.flags, ...options.flags],
      variant: variantOptions.variant,
    });
  }
}

export namespace LinkTask {
  export interface Options extends Omit<Task.Options, 'command' | 'description' | 'inputs' | 'outputs'> {
    sources: thl_task_cpp_CompileTasklike[];
    exe: thl.fs.Pathlike;
    libs?: StaticLibTask[];
  }
}
