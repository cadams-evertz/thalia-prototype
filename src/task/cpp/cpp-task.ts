import * as thl_fs from '../../fs';
import * as thl_process from '../../process';
import * as thl_task from '..';
import * as thl_text from '../../text';
import * as thl_util from '../../util';

export abstract class CppTask extends thl_task.Task {
  public readonly compileFlags: string[];
  public readonly defines: string[];
  public readonly includeDirs: thl_fs.Path[];
  public readonly linkFlags: string[];

  protected command?: string;

  constructor(options: CppTask.Options, protected readonly lastCommand: thl_util.PersistentData) {
    super(options);

    this.compileFlags = options.compileFlags ?? [];
    this.defines = options.defines ?? [];
    this.includeDirs = thl_fs.Path.ensureArray(options.includeDirs ?? []);
    this.linkFlags = options.linkFlags ?? [];
  }

  protected setCommand(template: string): void {
    const subsitutions = {
      compileFlags: this.compileFlags.join(' '),
      defines: this.defines.map(define => `-D${define}`).join(' '),
      includes: this.includeDirs.map(includeDir => `-I${includeDir}`).join(' '),
      linkFlags: this.linkFlags.join(' '),
    };

    this.command = thl_text.expandTemplate(template, subsitutions).replace(/  /g, ' ');
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
    return this.lastCommand.get() !== this.command;
  }

  public override async run(taskRunnerOptions?: thl_task.TaskRunner.Options): Promise<void> {
    if (!this.command) {
      throw new Error('Command not set');
    }

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
