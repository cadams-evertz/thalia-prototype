import * as thl_fs from '../../fs';
import * as thl_task from '..';
import * as thl_util from '../../util';

import { CompileTasklike } from './compile-task';
import { CppTask } from './cpp-task';
import { PassedOptions } from './passed-options';

export function link(options: PassedOptions<LinkTask.Options>): LinkTask {
  return thl_task.Task.create(() => new LinkTask(options));
}

class LinkTask extends CppTask {
  public readonly inputFiles: thl_fs.Path[];
  public readonly exe: thl_fs.Path;

  public override get outputs(): thl_fs.Path[] {
    return [this.exe];
  }

  constructor(options: PassedOptions<LinkTask.Options>) {
    options = PassedOptions.resolve(options);
    const inputTasks = CompileTasklike.asCompileTaskArray(options.inputs, options);
    const combinedOptions = CppTask.combineOptions(inputTasks);
    const exe = CppTask.addVariantSuffix(thl_task.BuildDir.asBuildPath(options.exe), options.variantSuffix);
    super(
      {
        ...options,
        ...combinedOptions,
        dependencies: [...(options.dependencies ?? []), ...inputTasks],
        description: options.description ?? `Linking ${exe}...`,
      },
      new thl_util.PersistentData(exe.append('.cmd')),
    );
    this.inputFiles = inputTasks.map(input => input.obj);
    this.exe = exe;
    this.setCommand(`g++ {{compileFlags}} ${this.inputFiles.join(' ')} -o ${exe} {{linkFlags}}`);
  }

  public override needToRun(): boolean {
    return super.needToRun() || this.isNewerThanOutputs(this.inputFiles) || this.areDependenciesNewerThanOutputs();
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
