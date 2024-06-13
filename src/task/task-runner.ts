import * as thl_process from '../process';
import { Task as thl_task_Task } from './task';

export class TaskRunner {
  public jobs: number;

  private readonly remainingTasks = new Set<thl_task_Task>();
  private readonly runningTasks = new Set<thl_task_Task>();

  constructor(task: thl_task_Task, options?: TaskRunner.Options) {
    this.jobs = options?.jobs ? options.jobs : Math.max(1, thl_process.cpuCount() - 1);
    this.add(task);
  }

  public async run(): Promise<void> {
    while (this.runningTasks.size < this.jobs) {
      if (!this.startNextTask()) {
        break;
      }
    }

    if (this.runningTasks.size === 0 && this.remainingTasks.size > 0) {
      throw new Error('Could not start at least one initial task');
    }

    while (this.runningTasks.size > 0) {
      try {
        const runningTaskPromises = [...this.runningTasks].map(task => task.promise);
        // @ts-ignore - Promise.any not found?
        const finished: Task = await Promise.any(runningTaskPromises);

        if (finished.status === 'error') {
          throw new Error('Task finished with error status');
        }

        this.runningTasks.delete(finished);

        if (this.remainingTasks.size > 0) {
          if (!this.startNextTask()) {
            if (this.runningTasks.size === 0) {
              throw new Error('Could not start the next task');
            }
          }
        }
      } catch (error) {
        throw new Error(`Task failed with: ${error}`);
      }
    }
  }

  private add(...tasks: thl_task_Task[]): void {
    for (const task of tasks) {
      this.add(...task.dependencies);

      if (!this.remainingTasks.has(task)) {
        this.remainingTasks.add(task);
      }
    }
  }

  private startNextTask(): boolean {
    for (const task of this.remainingTasks) {
      if (task.dependenciesComplete()) {
        task.start();
        this.runningTasks.add(task);
        this.remainingTasks.delete(task);
        return true;
      }
    }

    return false;
  }
}

export namespace TaskRunner {
  export interface Options {
    jobs?: number;
  }
}
