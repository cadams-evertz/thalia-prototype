import * as thl_fs from '../../fs';
import * as thl_task from '..';
import * as thl_util from '../../util';

import { CompileTasklike } from './compile-task';
import { CppTask } from './cpp-task';

export function link(taskDir: string, options: LinkTask.Options): LinkTask {
  return thl_task.Task.create(taskDir, () => new LinkTask(options));
}

class LinkTask extends CppTask {
  public readonly inputFiles: thl_fs.Path[];
  public readonly exe: thl_fs.Path;

  public override get outputs(): thl_fs.Path[] {
    return [this.exe];
  }

  constructor(options: LinkTask.Options) {
    const inputTasks = CompileTasklike.asCompileTaskArray(options.inputs, options);
    const combinedOptions = CppTask.combineOptions(inputTasks);
    const exe = thl_task.BuildDir.asBuildPath(options.exe);
    super(
      {
        ...options,
        ...combinedOptions,
        dependencies: inputTasks,
        description: options.description ?? `Linking ${exe}...`,
      },
      new thl_util.PersistentData(exe.append('.cmd')),
    );
    this.inputFiles = inputTasks.map(input => input.obj);
    this.exe = exe;
    this.command = `g++ ${this.compileFlags} ${this.inputFiles} -o ${exe} ${this.linkFlags}`;
  }

  public override needToRun(): boolean {
    return super.needToRun() || thl_fs.file.isNewer(this.inputFiles, this.exe);
  }

  public override async run(taskRunnerOptions?: thl_task.TaskRunner.Options): Promise<void> {
    thl_fs.dir.createForFile(this.exe);
    await super.run(taskRunnerOptions);
  }
}
namespace LinkTask {
  export interface Options extends CppTask.Options {
    inputs: CompileTasklike[];
    exe: thl_fs.Pathlike;
  }
}
