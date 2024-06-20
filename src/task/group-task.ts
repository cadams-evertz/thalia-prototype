import { Task } from './task';

export class GroupTask extends Task {
  constructor(options: GroupTask.Options) {
    super({
      ...options,
      description: '',
    });
  }

  public override async run(): Promise<void> {}
}

export namespace GroupTask {
  export interface Options extends Omit<Task.Options, 'description'> {
    dependencies: Task[];
  }
}
