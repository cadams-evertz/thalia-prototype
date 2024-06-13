import * as thl from 'thalia';

export class TestTask extends thl.task.Task {
  public override get dependencies(): thl.task.Task[] {
    return [];
  }

  public get options(): TestTask.Options {
    return super.options as TestTask.Options;
  }

  constructor(options: TestTask.Options) {
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
