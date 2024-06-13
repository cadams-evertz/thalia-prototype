import { TaskRunner, TaskRunner as tlh_task_TaskRunner } from './task-runner';

export abstract class Task {
  public abstract get dependencies(): Task[];

  protected _status: Task.Status = 'waiting';
  public get status(): Task.Status {
    return this._status;
  }

  private _options: Task.Options;
  public get options(): Task.Options {
    return this._options;
  }
  protected get baseOptions(): Task.Options {
    return this._options;
  }

  constructor(options: Task.Options) {
    this._options = options;
  }

  private _promise?: Promise<Task>;
  public get promise(): Promise<Task> | undefined {
    return this._promise;
  }

  public dependenciesComplete(): boolean {
    return this.dependencies.reduce((prev, dependency) => prev && dependency.status === 'complete', true);
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
  export interface Options {}

  export type Status = 'waiting' | 'running' | 'complete' | 'error';
}
