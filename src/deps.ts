import * as thl_log from './log';
import * as thl_process from './process';
import * as thl_util from './util';

export function ensureInstalled(packageNames: thl_util.ArrayOrSingle<string>): void {
  packageNames = thl_util.ensureArray(packageNames);

  for (const packageName of packageNames) {
    thl_log.info(`Ensuring package ${packageName} is installed...`);

    if (isInstalled(packageName)) {
      thl_log.action('- Already installed');
    } else {
      thl_log.action('- Not installed. Trying to install with apt now...');
      thl_process.execute(`sudo apt install -y ${packageName}`);

      if (isInstalled(packageName)) {
        thl_log.action(`${packageName} installed successfully`);
      } else {
        thl_log.error(`${packageName} failed to install`);
      }
    }
  }
}

export function isInstalled(packageName: string): boolean {
  return (
    thl_process.execute(`dpkg -s ${packageName}`, { echoCommand: false, exitOnError: false, hideOutput: true })
      .exitCode === 0
  );
}
