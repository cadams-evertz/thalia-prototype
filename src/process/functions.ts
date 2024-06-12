import * as childProcess from 'child_process';
import * as os from 'os';

import * as thl_fs from '../fs';
import * as thl_log from '../log';
import * as thl_process from '../process';

export type ExecuteResult = { exitCode: number; output?: string };

export function args(): string[] {
  return process.argv.slice(2);
}

export function cpuCount(): number {
  return os.cpus().length;
}

export function execute(
  command: string | thl_fs.Path,
  options?: { captureOutput?: boolean; echoCommand?: boolean; exitOnError?: boolean; hideOutput?: boolean },
): ExecuteResult {
  if (command instanceof thl_fs.Path) {
    command = command.absolute();
  }

  if (options?.echoCommand ?? true) {
    thl_log.command(command);
  }

  const result = childProcess.spawnSync(command, {
    shell: true,
    stdio: options?.captureOutput ? 'pipe' : options?.hideOutput ? 'ignore' : 'inherit',
  });
  const exitCode = result.status ?? 0;

  if (exitCode !== 0 && (options?.exitOnError ?? true)) {
    throw new thl_process.ExitError(`${command} failed`, exitCode);
  }

  return { exitCode, output: options?.captureOutput ? `${result.output[1]}` : undefined };
}

export async function executeAsync(
  command: string | thl_fs.Path,
  options?: { captureOutput?: boolean; echoCommand?: boolean; exitOnError?: boolean; hideOutput?: boolean },
): Promise<ExecuteResult> {
  if (command instanceof thl_fs.Path) {
    command = command.absolute();
  }

  if (options?.echoCommand ?? true) {
    thl_log.command(command);
  }

  const spawned = childProcess.spawn(command, {
    shell: true,
    stdio: options?.captureOutput ? 'pipe' : options?.hideOutput ? 'ignore' : 'inherit',
  });

  return new Promise<{ exitCode: number; output: string }>((resolve, reject) => {
    let output: string | undefined = undefined;

    if (options?.captureOutput) {
      spawned.stdout.on('data', data => {
        output = output !== undefined ? output + data : data;
      });
    }

    spawned.on('close', exitCode => {
      if (exitCode !== 0 && (options?.exitOnError ?? true)) {
        reject(new thl_process.ExitError(`${command} failed`, exitCode));
      } else {
        resolve({ exitCode, output });
      }
    });
  });
}
