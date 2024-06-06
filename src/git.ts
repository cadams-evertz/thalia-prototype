import * as thl_fs from './fs';
import * as thl_log from './log';
import * as thl_process from './process';

export function get(name: string, repoUrl: string, checkoutDirName: string, tag?: string): void {
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
      thl_process.execute(`git checkout tags/${tag}`);
    });
  }

  thl_fs.dir.setCurrent(oldCurrentDir);
}
