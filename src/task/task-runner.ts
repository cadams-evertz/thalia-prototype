import * as thl_debug from '../debug';
import * as thl_log from '../log';
import * as thl_process from '../process';

import { Task, Task as thl_task_Task } from './task';

export namespace TaskRunner {
  export interface Options {
    debug?: Debug;
    jobs?: number;
  }
}

export type Debug = 'brief' | 'verbose';

export async function run(taskOrTasks: thl_task_Task | thl_task_Task[], options?: TaskRunner.Options): Promise<void> {
  await new TaskRunner(taskOrTasks, options).run();
}

class TaskRunner {
  private readonly debug?: Debug;
  private readonly jobs: number;
  private readonly remainingTasks = new Set<thl_task_Task>();
  private readonly runningTasks = new Set<thl_task_Task>();

  constructor(taskOrTasks: thl_task_Task | thl_task_Task[], private readonly options?: TaskRunner.Options) {
    this.debug = options?.debug;
    this.jobs = options?.jobs ? options.jobs : Math.max(1, thl_process.cpuCount() - 1);

    const tasks = Array.isArray(taskOrTasks) ? taskOrTasks : [taskOrTasks];

    for (const task of tasks) {
      for (const allTask of task.allTasks) {
        this.remainingTasks.add(allTask);
      }
    }
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
        const finished: thl_task_Task = await Promise_any(runningTaskPromises);

        this.debugLog(`End`, finished);

        if (finished.status === 'error') {
          throw new Error(`Task '${finished.description}' finished with error status`);
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

  private startNextTask(): boolean {
    for (const task of this.remainingTasks) {
      const incompleteDependencies = Task.incomplete(task.dependencies);

      if (incompleteDependencies.length === 0) {
        this.remainingTasks.delete(task);

        // @ts-ignore - Protected member access
        if (task.needToRun()) {
          this.debugLog(`Start`, task);
          task.start(this.options);
          this.runningTasks.add(task);
        } else {
          this.debugLog(`Unchanged`, task);
        }

        return true;
      } else {
        this.debugLog(`Dependencies not yet complete for`, task);

        for (const incompleteDependency of incompleteDependencies) {
          this.debugLog(`- Incomplete`, incompleteDependency);
        }
      }
    }

    return false;
  }

  private debugLog(message: string, task: thl_task_Task): void {
    if (this.options?.debug) {
      thl_log.debug(
        `[TaskRunner] ${message} ` +
          (this.debug === 'brief' ? `'${task.description}'` : thl_debug.Repr.fromObject(task).toString()),
      );
    }
  }
}

// Stub for missing(?) Promise.any()
function Promise_any<T>(promises: (Promise<T> | undefined)[]): Promise<T> {
  // @ts-ignore - Promise.any not found?
  return Promise.any(promises);
}
