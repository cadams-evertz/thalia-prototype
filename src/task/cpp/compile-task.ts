import * as thl_fs from '../../fs';
import * as thl_task from '..';
import * as thl_util from '../../util';

import { CppTask } from './cpp-task';
import { PassedOptions } from './passed-options';

export function compile(options: PassedOptions<CompileTask.Options>): CompileTask {
  return thl_task.Task.create(() => new CompileTask(options));
}

class CompileTask extends CppTask {
  public readonly obj: thl_fs.Path;
  public readonly source: thl_fs.Path;

  private readonly cppDeps: thl_fs.Path;

  public override get outputs(): thl_fs.Path[] {
    return [this.obj];
  }

  constructor(options: PassedOptions<CompileTask.Options>) {
    options = PassedOptions.resolve(options);
    const source = thl_task.FilesProvider.toPath(options.source);
    const obj = CppTask.addVariantSuffix(thl_task.BuildDir.asBuildPath(source.append('.o')), options.variantSuffix);
    super(
      {
        ...options,
        dependencies: thl_task.Task.filterArray([options.source]),
        description: options.description ?? `Compiling ${source}...`,
      },
      new thl_util.PersistentData(obj.append('.cmd')),
    );
    this.obj = obj;
    this.cppDeps = this.obj.append('.d');
    this.source = source;
    this.setCommand(`g++ -MMD -MF ${this.cppDeps} {{compileFlags}} {{includes}} {{defines}} -c ${source} -o ${obj}`);
  }

  public override needToRun(): boolean {
    const cppDepFilePaths = this.loadCppDeps();
    return super.needToRun() || this.isNewerThanOutputs([this.source, ...cppDepFilePaths]);
  }

  public override async run(taskRunnerOptions?: thl_task.TaskRunner.Options): Promise<void> {
    thl_fs.dir.createForFile(this.obj);
    await super.run(taskRunnerOptions);
    this.postProcessCppDeps();
  }

  private loadCppDeps(): thl_fs.Path[] {
    return this.cppDeps.exists()
      ? (thl_fs.file.readJson(this.cppDeps) as string[]).map(filename => thl_fs.Path.ensure(filename))
      : [];
  }

  private postProcessCppDeps(): void {
    if (this.cppDeps.exists()) {
      const deps = thl_fs.file.readText(this.cppDeps).split('\n');
      const fixedDeps = deps
        .slice(2)
        .map(line => line.trim())
        .filter(line => line)
        .map(line => (line.endsWith('\\') ? line.slice(0, -1) : line))
        .map(line => line.trim());
      thl_fs.file.writeJson(this.cppDeps, fixedDeps);
    }
  }
}

namespace CompileTask {
  export interface Options extends CppTask.Options {
    source: thl_task.FilesProviderlike;
  }
}

export type CompileTasklike = thl_task.FilesProviderlike | CompileTask;

export namespace CompileTasklike {
  export function asCompileTask(value: CompileTasklike, options: Omit<CompileTask.Options, 'source'>): CompileTask {
    return value instanceof CompileTask ? value : new CompileTask({ ...options, source: value });
  }

  export function asCompileTaskArray(
    values: CompileTasklike[],
    options: Omit<CompileTask.Options, 'source'>,
  ): CompileTask[] {
    return values.map(value => CompileTasklike.asCompileTask(value, options));
  }
}
