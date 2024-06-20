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
    const lib = thl.fs.Path.ensure(options.lib);
    super({
      ...combinedOptions2,
      description: sources.length > 0 ? `Creating ${lib}...` : lib.absolute(),
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
}

export namespace StaticLibTask {
  export interface Options extends Omit<Task.Options, 'command' | 'description' | 'inputs' | 'outputs'> {
    sources?: CompileTasklike[];
    lib: thl.fs.Pathlike;
    libs?: StaticLibTask[];
  }
}
