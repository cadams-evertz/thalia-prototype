import * as thl_fs from '../fs';

import { Task } from './task';

export interface FilesProvider {
  outputs: thl_fs.Path[];
}

export namespace FilesProvider {
  export function is(value: any): value is FilesProvider {
    return value?.outputs;
  }

  export function toPath(item: FilesProviderlike): thl_fs.Path {
    const paths = toPaths([item]);
    if (paths.length !== 1) {
      throw new Error(`Expected exactly one path, but got ${paths.length}`);
    }
    return paths[0];
  }

  export function toPaths(items: FilesProviderlike[]): thl_fs.Path[] {
    return items
      .map(item => {
        if (FilesProvider.is(item)) {
          return item.outputs;
        } else if (item instanceof Task) {
          return FilesProvider.is(item) ? item.outputs : [];
        } else {
          return thl_fs.Path.ensure(item);
        }
      })
      .flat();
  }
}

export type FilesProviderlike = thl_fs.Pathlike | FilesProvider | Task;
