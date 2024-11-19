import * as thl_fs from '../../fs';
import * as thl_pkg from '../../pkg';
import * as thl_task from '..';

export class ZipTask extends thl_task.FileProviderTask {
  private readonly inputs: thl_task.FileProviderTask[];
  private readonly output: thl_fs.Path;
  private readonly rootDir?: thl_fs.Path;

  constructor(options: ZipTask.Options) {
    const inputs = (options.inputs ?? []).map(input => thl_task.FileProviderTask.ensure(input));
    const output = thl_task.BuildDir.asBuildPath(options.output);
    super({
      ...options,
      description: `Creating package ${output}...`,
      dependencies: inputs,
      files: [output],
    });
    this.inputs = inputs;
    this.output = output;
    this.rootDir = options.rootDir ? thl_fs.Path.ensure(options.rootDir) : undefined;
  }

  public override async run(): Promise<void> {
    thl_pkg.zip(this.output, this.inputs.map(input => input.files).flat(), { rootDir: this.rootDir });
  }
}

export namespace ZipTask {
  export interface Options extends Omit<thl_task.FileProviderTask.Options, 'description' | 'files'> {
    inputs: thl_task.FileProviderTasklike[];
    output: thl_fs.Pathlike;
    rootDir?: thl_fs.Pathlike;
  }
}
