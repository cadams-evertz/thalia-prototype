import * as thl_debug from '../debug';
import * as thl_log from '../log';

import { TaskRunner as tlh_task_TaskRunner } from './task-runner';

export abstract class Task {
  public readonly dependencies: Task[];
  public readonly description: string;

  protected _status: Task.Status = 'waiting';
  public get status(): Task.Status {
    return this._status;
  }

  constructor(options: Task.Options) {
    this.dependencies = options.dependencies ?? [];
    this.description = options.description;
  }

  private _promise?: Promise<Task>;
  public get promise(): Promise<Task> | undefined {
    return this._promise;
  }

  public static is(value: unknown): value is Task {
    return value instanceof Task;
  }

  public async runAll(options?: tlh_task_TaskRunner.Options): Promise<void> {
    await new tlh_task_TaskRunner(this, options).run();
  }

  public start(): void {
    this._status = 'running';
    this._promise = new Promise<Task>(resolve => {
      this.run()
        .then(() => {
          this._status = 'complete';
          resolve(this);
        })
        .catch(() => {
          this._status = 'error';
          resolve(this);
        });
    });
  }

  public abstract run(): Promise<void>;
  public abstract repr(): thl_debug.Repr;

  protected logDescription(): void {
    if (this.description) {
      thl_log.action(this.description);
    }
  }
}

export namespace Task {
  export interface Options {
    dependencies?: Task[];
    description: string;
  }

  export type Status = 'waiting' | 'running' | 'complete' | 'error';
}
