import * as thalia_log from './log';
import * as thalia_process from './process';

import { ensureArray, ArrayOrSingle } from './internal';

export function ensureInstalled(packageNames: ArrayOrSingle<string>): void {
  packageNames = ensureArray(packageNames);

  for (const packageName of packageNames) {
    thalia_log.info(`Ensuring package ${packageName} is installed...`);

    if (isInstalled(packageName)) {
      thalia_log.action('- Already installed');
    } else {
      thalia_log.action('- Not installed. Trying to install with apt now...');
      thalia_process.execute(`sudo apt install -y ${packageName}`);

      if (isInstalled(packageName)) {
        thalia_log.action(`${packageName} installed successfully`);
      } else {
        thalia_log.error(`${packageName} failed to install`);
      }
    }
  }
}

export function isInstalled(packageName: string): boolean {
  return (
    thalia_process.execute(`dpkg -s ${packageName}`, { echoCommand: false, exitOnError: false, hideOutput: true })
      .exitCode === 0
  );
}
