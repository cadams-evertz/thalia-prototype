import * as thalia_fs from './fs';
import * as thalia_log from './log';
import * as thalia_process from './process';

export function get(name: string, repoUrl: string, checkoutDirName: string, tag?: string): void {
  const checkoutDirPath = thalia_fs.Path.ensure(checkoutDirName);
  const oldCurrentDir = thalia_fs.dir.getCurrent();

  if (checkoutDirPath.exists()) {
    thalia_fs.dir.setCurrent(checkoutDirPath);

    thalia_log.action(`Fetching ${name} from ${repoUrl}`);
    thalia_process.execute('git fetch --tags --force');
  } else {
    const checkoutParentPath = checkoutDirPath.dirPath();

    thalia_fs.dir.create(checkoutParentPath);
    thalia_fs.dir.setCurrent(checkoutParentPath);

    thalia_log.action(`Cloning ${name} from ${repoUrl}`);
    thalia_process.execute(`git clone ${repoUrl}`);
    thalia_fs.dir.setCurrent(checkoutDirPath);
  }

  if (tag) {
    thalia_log.action(`Checking out ${name} at tag: ${tag}`);
    thalia_log.setOptionsWhile({ pathConversion: false }, () => {
      thalia_process.execute(`git checkout tags/${tag}`);
    });
  }

  thalia_fs.dir.setCurrent(oldCurrentDir);
}
