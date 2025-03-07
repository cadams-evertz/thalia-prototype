import * as thl_fs from '../fs';
import * as thl_util from '../util';

import { FilesProvider, FilesProviderlike } from './files-provider';
import { Task } from './task';
import { TaskRunner } from './task-runner';

export function files(options: thl_util.Resolvable<FilesTask.Options>): FilesTask {
  return Task.create(() => new FilesTask(options));
}

class FilesTask extends Task {
  private readonly _outputs: thl_fs.Path[];
  public override get outputs(): thl_fs.Path[] {
    return this._outputs;
  }

  constructor(options: thl_util.Resolvable<FilesTask.Options>) {
    options = thl_util.Resolvable.resolve(options);
    super(options);
    this._outputs = FilesProvider.toPaths(options.inputs);
  }

  public override needToRun(): boolean {
    return false;
  }

  public override async run(taskRunnerOptions?: TaskRunner.Options): Promise<void> {}
}

namespace FilesTask {
  export interface Options extends Task.Options {
    inputs: FilesProviderlike[];
  }
}
