import * as thl_fs from '../fs';

import { Task } from './task';

export abstract class FilesProviderTask extends Task {
  public outputs: thl_fs.Path[] = [];

  public static toPaths(items: FilesProviderTasklike[]): thl_fs.Path[] {
    return items.map(item => (item instanceof FilesProviderTask ? item.outputs : thl_fs.Path.ensure(item))).flat();
  }
}

export type FilesProviderTasklike = thl_fs.Pathlike | FilesProviderTask;
