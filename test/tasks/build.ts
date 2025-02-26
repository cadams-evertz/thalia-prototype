/*
 * TODO
 *
 * - Static library task
 * - Generated code
 * - C++ deps generation and parsing
 * - Prebuilt static library task
 * - Apt task
 */

import * as thl from 'thalia';

// import * as thlWip from './thl-wip';
thl.task.BuildDir.set(thl.fs.dir.getCurrent(), 'build-out');

import { appx } from './app/x/build';

export function test(taskDir: string, options: thl.util.Resolvable<TestTask.Options>): TestTask {
  return thl.task.Task.create(taskDir, options, options => new TestTask(options));
}

class TestTask extends thl.task.Task {
  public readonly _needToRun?: boolean;
  public readonly dummy: string;

  public override get outputs(): thl.fs.Path[] {
    return [];
  }

  constructor(options: TestTask.Options) {
    super(options);
    this._needToRun = options.needToRun;
    this.dummy = 'dummy';
  }

  public override needToRun(): boolean {
    return this._needToRun !== undefined
      ? this._needToRun
      : this.dependencies.length > 0 && thl.task.Task.allUnchanged(this.dependencies)
      ? false
      : true;
  }

  public override async run(taskRunnerOptions?: thl.task.TaskRunner.Options): Promise<void> {
    if (taskRunnerOptions?.debug) {
      console.log(`${this.dummy} debug...`);
    }

    await thl.util.asyncTimeout(500);

    console.log(`${this.dummy} done`);
  }
}

namespace TestTask {
  export interface Options extends thl.task.Task.Options {
    needToRun?: boolean;
  }
}

thl.util.main(async (args: string[]) => {
  thl.log.info('=== START ===');

  // const echoCommand = args.includes('--echo-commands');
  const clean = args.includes('--clean') || args.includes('--rebuild');
  const build = args.includes('--rebuild') || !args.includes('--clean');

  if (clean) {
    thl.task.BuildDir.clean();
  }

  if (build) {
    // await localTest();
    // await shellTest();
    await cppTest();
  }

  thl.log.info('=== END ===');
});

async function localTest(): Promise<void> {
  const compileA = test(__dirname, { description: 'Compile A', needToRun: true });
  const compileB = test(__dirname, { description: 'Compile B', needToRun: true });
  const compileC = test(__dirname, { description: 'Compile C', needToRun: false });
  const link = test(__dirname, { description: 'Link', dependencies: [compileA, compileB, compileC] });
  const package_ = test(__dirname, { description: 'Package', dependencies: [link] });

  await thl.task.run(package_, { debug: 'brief' });
}

async function shellTest(): Promise<void> {
  const genx = thl.task.shell(__dirname, {
    description: 'Gen to xxx',
    output: 'xxx',
    commands: ['echo xxx > {{output}}'],
    needToRun: (_, outputs) => {
      const output = outputs[0];
      return output.exists() ? thl.fs.file.readText(output) !== 'xxx\n' : true;
    },
  });
  const genz = thl.task.shell(__dirname, {
    description: 'Gen to zzz',
    output: 'zzz',
    commands: ['echo zzz > {{output}}'],
    needToRun: (_, outputs) => {
      const output = outputs[0];
      return output.exists() ? thl.fs.file.readText(output) !== 'zzz\n' : true;
    },
  });
  const cat1 = thl.task.shell(__dirname, {
    description: 'Cat to ccc',
    inputs: ['aaa', 'bbb', genx, genz],
    output: 'ccc',
    commands: ['cat {{inputs}} > {{output}}'],
  });
  // await thl.task.run(cat1, { debug: 'brief' });

  const zip = thl.task.pkg.zip(__dirname, {
    inputs: [genx, genz, cat1],
    zip: 'shell.zip',
    rootDir: thl.task.BuildDir.buildDir,
  });

  await thl.task.run(zip, { debug: 'brief' });
}

async function cppTest(): Promise<void> {
  await thl.task.run(appx, { debug: 'brief' });

  const zip = thl.task.pkg.zip(__dirname, {
    inputs: [appx],
    zip: 'cpp.zip',
    rootDir: thl.task.BuildDir.buildDir,
  });

  await thl.task.run(zip, { debug: 'brief' });
}
