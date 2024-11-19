import * as thl_fs from '../fs';

import { Task } from './task';

export abstract class FileProviderTask extends Task {
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

  public static ensure(value: FileProviderTasklike): FileProviderTask {
    return FileProviderTask.is(value) ? value : new StaticFileTask({ description: `${value}`, files: [value] });
  }

  public static ensureArray(values: FileProviderTasklike[]): FileProviderTask[] {
    return values.map(value => FileProviderTask.ensure(value));
  }

  public static is(value: unknown): value is FileProviderTask {
    return value instanceof FileProviderTask;
  }

  public confirmExists(): void {
    for (const file of this.files) {
      if (!file.exists()) {
        throw new Error(`Expected file ${file} does not exist`);
      }
    }
  }

  public static confirmAllExists(tasks: FileProviderTask[]): void {
    for (const task of tasks) {
      task.confirmExists();
    }
  }
}

export namespace FileProviderTask {
  export interface Options extends Task.Options {
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
