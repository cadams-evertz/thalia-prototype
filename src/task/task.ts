import * as thl_log from '../log';

import { TaskRunner } from './task-runner';

export abstract class Task {
  public get allTasks(): Task[] {
    return [...this.dependencies.map(dependency => dependency.allTasks).flat(), this];
  }

  public get dependencies(): Task[] {
    return [];
  }

  public readonly description: string;

  protected _status: Task.Status = 'pending';
  public get status(): Task.Status {
    return this._status;
  }

  constructor(options: Task.Options) {
    this.description = options.description;
  }

  private _promise?: Promise<Task>;
  public get promise(): Promise<Task> | undefined {
    return this._promise;
  }

  public static filterArray(items: (Task | unknown)[]): Task[] {
    return items.filter(input => input instanceof Task) as Task[];
  }

  public start(taskRunnerOptions?: TaskRunner.Options): void {
    if (!this.needToRun()) {
      this._status = 'unchanged';
    } else {
      this._status = 'running';

      this._promise = new Promise<Task>(resolve => {
        this.run(taskRunnerOptions)
          .then(() => {
            this._status = 'complete';
            resolve(this);
          })
          .catch(error => {
            thl_log.error(error);
            this._status = 'error';
            resolve(this);
          });
      });
    }
  }

  protected abstract needToRun(): boolean;
  protected abstract run(taskRunnerOptions?: TaskRunner.Options): Promise<void>;

  protected logDescription(): void {
    if (this.description) {
      thl_log.action(this.description);
    }
  }
}

export namespace Task {
  export interface Options {
    description: string;
  }

  export type Status = 'complete' | 'error' | 'pending' | 'running' | 'unchanged';

  export namespace Status {
    export function allUnchanged(statuses: Status[]): boolean {
      return statuses.every(status => status === 'unchanged');
    }

    export function isComplete(status: Status): boolean {
      return status === 'complete' || status === 'unchanged';
    }
  }

  export function allUnchanged(tasks: Task[]): boolean {
    return tasks.every(task => task.status === 'unchanged');
  }

  export function incomplete(tasks: Task[]): Task[] {
    return tasks.filter(task => !Task.Status.isComplete(task.status));
  }
}
