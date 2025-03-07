import * as thl_fs from '../fs';
import * as thl_log from '../log';
import * as thl_util from '../util';
import { FilesProvider } from './files-provider';

import { TaskRunner } from './task-runner';

export abstract class Task implements FilesProvider {
  public get allTasks(): Task[] {
    return [...this.dependencies.map(dependency => dependency.allTasks).flat(), this];
  }

  public readonly dependencies: Task[];
  public readonly description?: string;

  public abstract outputs: thl_fs.Path[];

  private _promise?: Promise<Task>;
  public get promise(): Promise<Task> | undefined {
    return this._promise;
  }

  protected _status: Task.Status = 'pending';
  public get status(): Task.Status {
    return this._status;
  }

  constructor(options: Task.Options) {
    this.dependencies = options.dependencies ?? [];
    this.description = options.description;
  }

  public static create<TTask>(taskCreator: () => TTask): TTask {
    const userCodePath = thl_util.determineUserCodePath();
    return thl_fs.dir.setCurrentWhile(userCodePath.dirPath(), taskCreator);
  }

  public static filterArray(items: (Task | unknown)[]): Task[] {
    return items.filter(input => input instanceof Task) as Task[];
  }

  public start(
    taskRunnerOptions: TaskRunner.Options | undefined,
    statusChangedCallback: (status: Task.Status) => void,
  ): void {
    const setStatus = (status: Task.Status) => {
      this._status = status;
      statusChangedCallback(status);
    };

    if (!this.needToRun()) {
      setStatus('unchanged');
    } else {
      setStatus('running');

      this._promise = new Promise<Task>(resolve => {
        if (this.description) {
          thl_log.action(this.description);
        }

        this.run(taskRunnerOptions)
          .then(() => {
            setStatus('complete');
            resolve(this);
          })
          .catch(error => {
            thl_log.error(error);
            setStatus('error');
            resolve(this);
          });
      });
    }
  }

  public abstract needToRun(): boolean;
  public abstract run(taskRunnerOptions?: TaskRunner.Options): Promise<void>;

  protected areDependenciesNewerThanOutputs(): boolean {
    for (const dependency of this.dependencies) {
      if (thl_fs.file.isNewer(dependency.outputs, this.outputs)) {
        return true;
      }
    }

    return false;
  }

  protected isNewerThanOutputs(filenames: thl_util.ArrayOrSingle<thl_fs.Pathlike>): boolean {
    return thl_fs.file.isNewer(filenames, this.outputs);
  }
}

export namespace Task {
  export interface Options {
    dependencies?: Task[];
    description?: string;
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
