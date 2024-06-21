import { Task } from './task';

export class GroupTask<T extends Task> extends Task {
  constructor(options: GroupTask.Options<T>) {
    super({
      ...options,
      description: '',
    });
  }

  public override async run(): Promise<void> {}
}

export namespace GroupTask {
  export interface Options<T extends Task> extends Omit<Task.Options, 'description'> {
    dependencies: T[];
  }
}
