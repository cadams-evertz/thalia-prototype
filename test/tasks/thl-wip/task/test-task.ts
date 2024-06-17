import * as thl from 'thalia';

export class TestTask extends thl.task.Task {
  private readonly durationMs: number;
  private readonly fail: boolean;

  constructor(options: TestTask.Options) {
    super(options);
    this.durationMs = options.durationMs ?? 1000;
    this.fail = !!options.fail;
  }

  public override repr(): thl.debug.Repr {
    return new thl.debug.Repr('TestTask', { durationMs: this.durationMs, fail: this.fail });
  }

  public override async run(): Promise<void> {
    console.log(`${this.description}: START`);
    await thl.util.asyncTimeout(this.durationMs);
    if (this.fail) {
      console.log(`${this.description}: ERROR`);
      throw new Error('kaboom');
    }
    console.log(`${this.description}: END`);
  }
}

export namespace TestTask {
  export interface Options extends thl.task.Task.Options {
    name: string;
    durationMs?: number;
    fail?: boolean;
  }
}
