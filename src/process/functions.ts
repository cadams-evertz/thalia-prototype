import * as childProcess from 'child_process';

import * as thalia_fs from '../fs';
import * as thalia_log from '../log';
import * as thalia_process from '../process';

export function args(): string[] {
  return process.argv.slice(2);
}

export function execute(
  command: string | thalia_fs.Path,
  options?: { captureOutput?: boolean; echoCommand?: boolean; exitOnError?: boolean; hideOutput?: boolean },
): {
  exitCode: number;
  output: string;
} {
  if (command instanceof thalia_fs.Path) {
    command = command.absolute();
  }

  if (options?.echoCommand ?? true) {
    thalia_log.command(command);
  }

  const result = childProcess.spawnSync(command, {
    shell: true,
    stdio: options?.captureOutput ? 'pipe' : options?.hideOutput ? 'ignore' : 'inherit',
  });
  const exitCode = result.status ?? 0;

  if (exitCode !== 0 && (options?.exitOnError ?? true)) {
    throw new thalia_process.ExitError(`${command} failed`, exitCode);
  }

  return { exitCode, output: `${result.output[1]}` };
}
