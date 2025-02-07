import * as thl_fs from '../../fs';
import * as thl_pkg from '../../pkg';
import * as thl_task from '..';

export function zip(taskDir: string, options: ZipTask.Options): ZipTask {
  return thl_task.Task.create(taskDir, () => new ZipTask(options));
}

class ZipTask extends thl_task.FilesProviderTask {
  public readonly inputs: thl_fs.Path[];
  public readonly zip: thl_fs.Path;
  public readonly rootDir?: thl_fs.Path;

  public override get outputs(): thl_fs.Path[] {
    return [this.zip];
  }

  constructor(options: ZipTask.Options) {
    const zip = thl_task.BuildDir.asBuildPath(options.zip);
    super({
      ...options,
      dependencies: thl_task.Task.filterArray(options.inputs),
      description: options.description ?? `Creating package ${zip}...`,
    });
    this.inputs = thl_task.FilesProvider.toPaths(options.inputs);
    this.zip = zip;
    this.rootDir = options.rootDir ? thl_fs.Path.ensure(options.rootDir) : undefined;
  }

  public override needToRun(): boolean {
    return thl_fs.file.isNewer(this.inputs, this.zip);
  }

  public override async run(): Promise<void> {
    await thl_pkg.zip(this.zip, this.inputs, { rootDir: this.rootDir });
  }
}

namespace ZipTask {
  export interface Options extends thl_task.Task.Options {
    inputs: thl_task.FilesProviderlike[];
    rootDir?: thl_fs.Pathlike;
    zip: thl_fs.Pathlike;
  }
}
