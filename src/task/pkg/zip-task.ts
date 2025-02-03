import * as thl_fs from '../../fs';
import * as thl_pkg from '../../pkg';
import * as thl_task from '..';

export class ZipTask extends thl_task.FilesProviderTask<ZipTask.Options> {
  private inputs: thl_fs.Path[] = [];
  private readonly output: thl_fs.Path;
  private readonly rootDir?: thl_fs.Path;

  constructor(options: ZipTask.Options) {
    const dependencies = thl_task.Task.filterArray(options.inputs);
    const output = thl_task.BuildDir.asBuildPath(options.output);
    super(
      {
        ...options,
        description: options.description ?? `Creating package ${output}...`,
      },
      dependencies,
    );
    this.output = output;
    this.outputs = [output];
    this.rootDir = this.options.rootDir ? thl_fs.Path.ensure(this.options.rootDir) : undefined;
  }

  protected override prepare(): void {
    this.inputs = thl_task.FilesProviderTask.toPaths(this.options.inputs);
  }

  protected override needToRun(): boolean {
    return thl_fs.file.isNewer(this.inputs, this.output);
  }

  protected override async run(): Promise<void> {
    await thl_pkg.zip(this.output, this.inputs, { rootDir: this.rootDir });
  }
}

export namespace ZipTask {
  export interface Options extends thl_task.Task.Options {
    inputs: thl_task.FilesProviderTask[];
    output: thl_fs.Pathlike;
    rootDir?: thl_fs.Pathlike;
  }
}
