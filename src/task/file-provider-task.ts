import * as thl_debug from '../debug';
import * as thl_fs from '../fs';

import { Task as thl_task_Task } from './task';

export abstract class FileProviderTask extends thl_task_Task {
  public get file(): thl_fs.Path {
    if (this.files.length !== 1) {
      throw new Error('Task does not have a single file');
    }
    return this.files[0];
  }
  public readonly files: thl_fs.Path[];

  constructor(options: FileProviderTask.Options) {
    super(options);
    this.files = thl_fs.Path.ensureArray(options.files ?? []);
  }

  public static ensure(value: thl_fs.Pathlike | FileProviderTask): FileProviderTask {
    return FileProviderTask.is(value) ? value : new StaticFileTask({ description: `${value}`, files: [value] });
  }

  public static is(value: unknown): value is FileProviderTask {
    return value instanceof FileProviderTask;
  }
}

export namespace FileProviderTask {
  export interface Options extends thl_task_Task.Options {
    files?: thl_fs.Pathlike[];
  }
}

export type FileProviderTasklike = thl_fs.Pathlike | FileProviderTask;

export class StaticFileTask extends FileProviderTask {
  constructor(options: FileProviderTask.Options) {
    super(options);
  }

  public static is(value: unknown): value is FileProviderTask {
    return value instanceof FileProviderTask;
  }

  public async run(): Promise<void> {}
}

export namespace StaticFileTask {
  export interface Options extends FileProviderTask.Options {}
}
