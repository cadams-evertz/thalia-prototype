import * as thl_fs from '../fs';
import * as thl_util from '../util';

import { BuildDir } from './build-dir';
import { Task } from './task';
import { TaskRunner } from './task-runner';

export function code(taskDir: string, options: thl_util.Resolvable<CodeTask.Options>): CodeTask {
  return Task.create(taskDir, options, options => new CodeTask(options));
}

class CodeTask extends Task {
  private readonly _needToRun: (outputs: thl_fs.Path[]) => boolean;
  private readonly _run: (outputs: thl_fs.Path[]) => void | Promise<void>;

  private readonly _outputs: thl_fs.Path[];
  public override get outputs(): thl_fs.Path[] {
    return this._outputs;
  }

  constructor(options: CodeTask.Options) {
    const outputs = thl_util.ensureArray(options.output ?? options.outputs);
    super(options);
    this._needToRun = options.needToRun;
    this._outputs = BuildDir.asBuildPathArray(outputs);
    this._run = options.run;
  }

  public override needToRun(): boolean {
    return this._needToRun(this.outputs) || this.areDependenciesNewerThanOutputs();
  }

  public override async run(taskRunnerOptions?: TaskRunner.Options): Promise<void> {
    await this._run(this.outputs);
  }
}
namespace CodeTask {
  export interface Options extends Task.Options {
    run: (outputs: thl_fs.Path[]) => void | Promise<void>;
    needToRun: (outputs: thl_fs.Path[]) => boolean;
    output?: thl_fs.Pathlike;
    outputs?: thl_fs.Pathlike[];
  }
}
