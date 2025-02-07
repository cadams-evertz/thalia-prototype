import * as thl_fs from '../../fs';
import * as thl_process from '../../process';
import * as thl_task from '..';
import * as thl_util from '../../util';

export abstract class CppTask extends thl_task.FilesProviderTask {
  public readonly compileFlags: string[];
  public readonly defines: string[];
  public readonly defineFlags: string;
  public readonly includeDirs: thl_fs.Path[];
  public readonly includeFlags: string;
  public readonly linkFlags: string[];

  protected command: string = 'undefined';

  constructor(options: CppTask.Options, protected readonly lastCommand: thl_util.PersistentData) {
    super(options);

    this.compileFlags = options.compileFlags ?? [];
    this.defines = options.defines ?? [];
    this.defineFlags = this.defines.map(define => `-D${define}`).join(' ');
    this.includeDirs = thl_fs.Path.ensureArray(options.includeDirs ?? []);
    this.includeFlags = this.includeDirs.map(includeDir => `-I${includeDir}`).join(' ') ?? '';
    this.linkFlags = options.linkFlags ?? [];
  }

  public static combineOptions(tasks: CppTask[]): CppTask.Options {
    function combine<T>(a: T[] | undefined, b: T[] | undefined): T[] {
      return thl_util.unique([...(a ?? []), ...(b ?? [])]);
    }

    return tasks.reduce((combinedOptions, task) => {
      return {
        compileFlags: combine(combinedOptions.compileFlags, task.compileFlags),
        defines: combine(combinedOptions.defines, task.defines),
        includeDirs: combine(combinedOptions.includeDirs, task.includeDirs),
        linkFlags: combine(combinedOptions.linkFlags, task.linkFlags),
      };
    }, {} as CppTask.Options);
  }

  public override needToRun(): boolean {
    this.command = this.command.replace(/  /g, ' ');
    return this.lastCommand.get() !== this.command;
  }

  public override async run(taskRunnerOptions?: thl_task.TaskRunner.Options): Promise<void> {
    await thl_process.executeAsync(this.command);
    this.lastCommand.set(this.command);
  }
}

export namespace CppTask {
  export interface Options extends thl_task.Task.Options {
    compileFlags?: string[];
    defines?: string[];
    includeDirs?: thl_fs.Pathlike[];
    linkFlags?: string[];
  }
}
