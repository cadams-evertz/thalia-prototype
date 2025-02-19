import * as thl_fs from './fs';
import * as thl_log from './log';
import * as thl_process from './process';

export function get({
  name,
  repoUrl,
  checkoutDirName,
  tag,
}: {
  name: string;
  repoUrl: string;
  checkoutDirName: string;
  tag?: string;
}): void {
  const checkoutDirPath = thl_fs.Path.ensure(checkoutDirName);
  const oldCurrentDir = thl_fs.dir.getCurrent();

  if (checkoutDirPath.exists()) {
    thl_fs.dir.setCurrent(checkoutDirPath);

    thl_log.action(`Fetching ${name} from ${repoUrl}`);
    thl_process.execute('git fetch --tags --force');
  } else {
    const checkoutParentPath = checkoutDirPath.dirPath();

    thl_fs.dir.create(checkoutParentPath);
    thl_fs.dir.setCurrent(checkoutParentPath);

    thl_log.action(`Cloning ${name} from ${repoUrl}`);
    thl_process.execute(`git clone ${repoUrl}`);
    thl_fs.dir.setCurrent(checkoutDirPath);
  }

  if (tag) {
    thl_log.action(`Checking out ${name} at tag: ${tag}`);
    thl_log.setOptionsWhile({ pathConversion: false }, () => {
      thl_process.execute(`git checkout tags/${tag}`, { echoCommand: false });
    });
  }

  thl_fs.dir.setCurrent(oldCurrentDir);
}

export function log({
  after,
  count,
  format,
  grep,
  path,
}: {
  after?: string;
  count?: number;
  format?: 'email' | 'full' | 'fuller' | 'medium' | 'oneline' | 'raw' | 'reference' | 'short';
  grep?: string;
  path?: string;
}): string {
  let command = 'git log';

  if (after) {
    command += ` --after='${after}'`;
  }

  if (count) {
    command += ` -${count}`;
  }

  if (format) {
    command += ` --format=${format}`;
  }

  if (grep) {
    command += ` --grep='${grep}'`;
  }

  if (path) {
    command += ` '${path}'`;
  }

  return thl_process.execute(command, { captureOutput: true, echoCommand: false }).output ?? '';
}

export function show({ commit, nameOnly }: { commit?: string; nameOnly?: boolean }): string {
  let command = 'git show';

  if (nameOnly) {
    command += ' --name-only';
  }

  if (commit) {
    command += ` '${commit}'`;
  }

  return thl_process.execute(command, { captureOutput: true, echoCommand: false }).output ?? '';
}
