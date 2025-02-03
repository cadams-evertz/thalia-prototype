import * as thl_fs from '../fs';

import { Task } from './task';

export abstract class FilesProviderTask<TOptions extends Task.Options = Task.Options> extends Task<TOptions> {
  public outputs: thl_fs.Path[] = [];

  public static toPaths(items: FilesProviderTasklike[]): thl_fs.Path[] {
    return items.map(item => (item instanceof FilesProviderTask ? item.outputs : thl_fs.Path.ensure(item))).flat();
  }
}

export type FilesProviderTasklike = thl_fs.Pathlike | FilesProviderTask;
