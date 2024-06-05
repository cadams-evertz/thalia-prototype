import * as fs from 'fs';

import * as thalia_if from '../if';
import * as thalia_log from '../log';
import * as thalia_fs_file from './file';
import { Path as thalia_fs_Path, Pathlike as thalia_fs_Pathlike } from './Path';

import { ArrayOrSingle, smartOperation } from '../internal';

export function copy(
  srcDirName: thalia_fs_Pathlike,
  destDirName: thalia_fs_Pathlike,
  options?: smartOperation.Options<{ source: thalia_fs_Path; destination: thalia_fs_Path }>,
): boolean {
  const srcDirPath = thalia_fs_Path.ensure(srcDirName);
  const destDirPath = thalia_fs_Path.ensure(destDirName);
  let executed = false;

  for (const srcFilePath of thalia_fs_file.find(srcDirPath)) {
    const destFilePath = destDirPath.joinWith(srcFilePath.relativeTo(srcDirPath));
    executed = thalia_fs_file.copy(srcFilePath, destFilePath, options) || executed;
  }

  return executed;
}

export function create(dirName: thalia_fs_Pathlike, options?: smartOperation.Options<thalia_fs_Path>): boolean {
  options = { ...{ if: thalia_if.doesNotExist }, ...options };

  const dirPath = thalia_fs_Path.ensure(dirName);

  return smartOperation<thalia_fs_Path>(options, dirPath, () => {
      thalia_log.action(`Creating directory ${dirPath}...`);
      fs.mkdirSync(dirPath.absolute(), { recursive: true });
  });
}

export function createForFile(filename: thalia_fs_Pathlike, options?: smartOperation.Options<thalia_fs_Path>): boolean {
  const filePath = thalia_fs_Path.ensure(filename);
  return create(filePath.dirPath(), options);
}

export function delete_(
  potentialDirnames: ArrayOrSingle<thalia_fs_Pathlike>,
  options?: smartOperation.Options<thalia_fs_Path>,
): boolean {
  options = { ...{ if: thalia_if.exists }, ...options };

  const dirPaths = thalia_fs_Path.ensureArray(potentialDirnames);
  let executed = false;

  for (const dirPath of dirPaths) {
    if (
      smartOperation(options, dirPath, () => {
          thalia_log.action(`Deleting ${dirPath}...`);
          fs.rmSync(dirPath.absolute(), { force: true, recursive: true });
      })
    ) {
      executed = true;
    }
  }

  return executed;
}

export function getCurrent(): thalia_fs_Path {
  return new thalia_fs_Path(process.cwd());
}

export function read(dirName: thalia_fs_Pathlike): thalia_fs_Path[] {
  const dirPath = thalia_fs_Path.ensure(dirName);
  return fs.readdirSync(dirPath.absolute()).map(filename => new thalia_fs_Path(filename, dirPath));
}

export function setCurrent(dirName: thalia_fs_Pathlike): void {
  const dirPath = thalia_fs_Path.ensure(dirName);
  process.chdir(dirPath.absolute());
}

export function setCurrentWhile(dirName: thalia_fs_Pathlike, work: () => void): void {
  const oldCurrent = getCurrent();
  try {
    setCurrent(dirName);
    work();
  } finally {
    setCurrent(oldCurrent);
  }
}
