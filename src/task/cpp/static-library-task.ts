import * as thl_fs from '../../fs';
import * as thl_task from '..';
import * as thl_util from '../../util';

import { CompileTasklike } from './compile-task';
import { CppTask } from './cpp-task';

export function staticLibrary(
  taskDir: string,
  options: thl_util.Resolvable<StaticLibraryTask.Options>,
): StaticLibraryTask {
  return thl_task.Task.create(taskDir, options, options => new StaticLibraryTask(options));
}

export class StaticLibraryTask extends CppTask {
  public readonly inputFiles: thl_fs.Path[];
  public readonly lib: thl_fs.Path;

  public override get outputs(): thl_fs.Path[] {
    return [this.lib];
  }

  constructor(options: StaticLibraryTask.Options) {
    const inputTasks = CompileTasklike.asCompileTaskArray(options.inputs, options);
    const combinedOptions = CppTask.combineOptions(inputTasks, options);
    const rawLib = thl_task.BuildDir.asBuildPath(options.lib);
    const lib = rawLib.dirPath().joinWith(`lib${rawLib.basename()}.a`);
    super(
      {
        ...combinedOptions,
        dependencies: inputTasks,
        description: options.description ?? `Linking ${lib}...`,
        linkFlags: [
          ...(combinedOptions.linkFlags ?? []),
          `-L${lib.dirPath().absolute()}`,
          `-l${lib.basename('.a').slice(3)}`,
        ],
      },
      new thl_util.PersistentData(lib.append('.cmd')),
    );
    this.inputFiles = inputTasks.map(input => input.obj);
    this.lib = lib;

    this.setCommand(`ar rs ${lib} ${this.inputFiles.join(' ')}`);
  }

  public override needToRun(): boolean {
    return super.needToRun() || thl_fs.file.isNewer(this.inputFiles, this.lib);
  }

  public override async run(taskRunnerOptions?: thl_task.TaskRunner.Options): Promise<void> {
    thl_fs.dir.createForFile(this.lib);
    await super.run(taskRunnerOptions);
  }
}

namespace StaticLibraryTask {
  export interface Options extends CppTask.Options {
    inputs: CompileTasklike[];
    lib: thl_fs.Pathlike;
  }
}
