import * as thl_debug from '../debug';
import * as thl_fs from '../fs';

import { FileOutputTask as thl_task_FileOutputTask } from './file-output-task';
import { Task as thl_task_Task } from './task';

export class StaticFileTask extends thl_task_FileOutputTask {
  public override get dependencies(): thl_task_Task[] {
    return [];
  }

  public readonly path: thl_fs.Path;

  constructor(options: StaticFileTask.Options) {
    const path = thl_fs.Path.ensure(options.path);
    super({
      ...options,
      description: path.absolute(),
      outputs: [path],
    });
    this.path = path;
    this._status = 'complete';
  }

  public override repr(): thl_debug.Repr {
    return new thl_debug.Repr('StaticFileTask', { path: this.path });
  }

  public override async run(): Promise<void> {}
}

export namespace StaticFileTask {
  export interface Options extends Omit<thl_task_Task.Options, 'description'> {
    path: thl_fs.Pathlike;
  }
}
