import * as thl_process from '../process';
import { Task as thl_task_Task } from './task';

export class Tasks {
  public jobs: number;

  private readonly tasks = new Set<thl_task_Task>();

  constructor(jobs?: number, tasks: thl_task_Task[] = []) {
    this.jobs = jobs ? jobs : Math.max(1, thl_process.cpuCount() - 1);

    this.add(...tasks);
  }

  public add(...tasks: thl_task_Task[]): void {
    for (const task of tasks) {
      this.add(...task.dependencies);

      if (!this.tasks.has(task)) {
        this.tasks.add(task);
      }
    }
  }

  public async run(): Promise<boolean> {
    const remainingTasks = new Set<thl_task_Task>(this.tasks);
    const runningTasks = new Set<thl_task_Task>();

    while (runningTasks.size < this.jobs) {
      if (!this.startNextTask(remainingTasks, runningTasks)) {
        break;
      }
    }

    while (runningTasks.size > 0) {
      try {
        // @ts-ignore - Promise.any not found?
        const finished: Task = await Promise.any([...runningTasks].map(task => task.promise));

        if (finished.status === 'error') {
          return false;
        }

        runningTasks.delete(finished);
        this.startNextTask(remainingTasks, runningTasks);
      } catch (error) {
        return false;
      }
    }

    return true;
  }

  private startNextTask(remainingTasks: Set<thl_task_Task>, runningTasks: Set<thl_task_Task>): boolean {
    for (const task of remainingTasks) {
      const allDependenciesComplete = task.dependencies.reduce(
        (prev, task) => prev && task.status === 'complete',
        true,
      );

      if (allDependenciesComplete) {
        task.start();
        runningTasks.add(task);
        remainingTasks.delete(task);
        return true;
      }
    }

    return false;
  }
}
