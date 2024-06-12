export abstract class Task {
  private _status: Task.Status = 'todo';
  public get status(): Task.Status {
    return this._status;
  }

  constructor(public readonly dependencies: Task[] = []) {}

  private _promise?: Promise<Task>;
  public get promise(): Promise<Task> | undefined {
    return this._promise;
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
  export type Status = 'todo' | 'running' | 'complete' | 'error';
}
