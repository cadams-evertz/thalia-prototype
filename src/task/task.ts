import { TaskRunner, TaskRunner as tlh_task_TaskRunner } from './task-runner';

export abstract class Task {
  private _status: Task.Status = 'waiting';
  public get status(): Task.Status {
    return this._status;
  }

  constructor(public readonly options: Task.Options) {}

  private _promise?: Promise<Task>;
  public get promise(): Promise<Task> | undefined {
    return this._promise;
  }

  public refreshStatus(): void {
    if (this._status !== 'waiting') {
      return;
    }

    if (this.options.dependencies) {
      const combinedDependencyStatus = this.options.dependencies.reduce((prev, dependency) => {
        dependency.refreshStatus();

        if (dependency.status === 'up-to-date') {
          return prev;
        } else if (dependency.status === 'complete') {
          return prev === 'up-to-date' ? 'complete' : prev;
        } else {
          return dependency.status;
        }
      }, 'up-to-date');

      switch (combinedDependencyStatus) {
        case 'complete':
          this._status = 'ready';
          break;

        case 'up-to-date':
          this._status = this.options.alwaysRun ? 'ready' : 'up-to-date';
          break;
      }
    } else {
      this._status = 'ready';
    }
  }

  public async runAll(options?: tlh_task_TaskRunner.Options): Promise<void> {
    new TaskRunner(this, options).run();
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
}

export namespace Task {
  export interface Options {
    alwaysRun?: boolean;
    dependencies?: Task[];
  }

  export type Status = 'waiting' | 'ready' | 'running' | 'complete' | 'up-to-date' | 'error';
}
