import * as thl from 'thalia';

export class TestTask extends thl.task.Task {
  constructor(public readonly options: TestTask.Options) {
    super(options);
  }

  public override async run(): Promise<void> {
    console.log(`${this.options.name}: START`);
    await thl.util.asyncTimeout(this.options.durationMs ?? 1000);
    if (this.options.fail) {
      console.log(`${this.options.name}: ERROR`);
      throw new Error('kaboom');
    }
    console.log(`${this.options.name}: END`);
  }
}

export namespace TestTask {
  export interface Options extends thl.task.Task.Options {
    name: string;
    durationMs?: number;
    fail?: boolean;
  }
}

export class CppTask extends thl.task.ChildProcessTask {
  constructor(options: CppTask.Options) {
    super({ ...options, command: `g++ ${options.commandSuffix}` });
  }
}

export namespace CppTask {
  export interface Options extends Omit<thl.task.ChildProcessTask.Options, 'command'> {
    commandSuffix: string;
  }
}

export class CppCompileTask extends CppTask {
  constructor(options: CppCompileTask.Options) {
    super({
      ...options,
      inputs: [options.source],
      outputs: [`${options.source}.o`],
      commandSuffix: `-c {{inputs}} -o {{outputs}}`,
    });
  }
}

export namespace CppCompileTask {
  export interface Options extends Omit<CppTask.Options, 'commandSuffix' | 'inputs' | 'outputs'> {
    source: thl.fs.Pathlike;
  }
}

export class CppLinkTask extends CppTask {
  constructor(options: CppLinkTask.Options) {
    super({ ...options, outputs: [options.output], commandSuffix: `{{inputs}} -o {{outputs}}` });
  }
}

export namespace CppLinkTask {
  export interface Options extends Omit<CppTask.Options, 'commandSuffix' | 'inputs' | 'outputs'> {
    inputs: CppCompileTask[];
    output: thl.fs.Pathlike;
  }
}

async function main(): Promise<void> {
  thl.log.info('=== START ===');

  const a_o = new CppCompileTask({
    source: 'a.cpp',
  });
  const b_o = new CppCompileTask({
    source: 'b.cpp',
  });
  const exe = new CppLinkTask({
    inputs: [a_o, b_o],
    output: 'a.out',
  });
  await exe.runAll();

  thl.log.info('=== END ===');
}

main();
