import * as thl_fs from '../../fs';
import * as thl_pkg from '../../pkg';
import * as thl_task from '..';

export class ZipTask extends thl_task.Task<ZipTask.Options, ZipTask.Data> {
  constructor(options: ZipTask.Options) {
    super(
      {
        ...options,
        description: options.description ?? (() => `Creating package ${this.data?.outputs[0]}...`),
      },
      thl_task.Task.filterArray(options.inputs),
    );
  }

  public override prepare(): ZipTask.Data {
    const inputs = thl_task.FilesProvider.toPaths(this.options.inputs);
    const outputs = [thl_task.BuildDir.asBuildPath(this.options.output)];
    const rootDir = this.options.rootDir ? thl_fs.Path.ensure(this.options.rootDir) : undefined;

    return { inputs, outputs, rootDir };
  }

  public override needToRun(data: ZipTask.Data): boolean {
    return thl_fs.file.isNewer(data.inputs, data.outputs[0]);
  }

  public override async run(data: ZipTask.Data): Promise<void> {
    await thl_pkg.zip(data.outputs[0], data.inputs, { rootDir: data.rootDir });
  }
}

export namespace ZipTask {
  export interface Options extends thl_task.Task.Options {
    inputs: thl_task.FilesProviderlike[];
    output: thl_fs.Pathlike;
    rootDir?: thl_fs.Pathlike;
  }

  export interface Data extends thl_task.FilesProvider {
    inputs: thl_fs.Path[];
    rootDir?: thl_fs.Path;
  }
}
