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

async function main(): Promise<void> {
  thl.log.info('=== START ===');

  const a = new thl.task.ChildProcessTask({ command: 'g++ -c a.cpp' });
  const b = new thl.task.ChildProcessTask({ command: 'g++ -c b.cpp' });
  const t1 = new TestTask({ name: 't1', fail: false });
  const exe = new thl.task.ChildProcessTask({ command: 'g++ a.o b.o', dependencies: [a, b, t1] });
  await exe.runAll();

  thl.log.info('=== END ===');
}

main();
