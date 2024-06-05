import * as fs from 'fs';

import * as thalia_log from '../log';
import * as thalia_fs_file from './file';
import { Path as thalia_fs_Path, Pathlike as thalia_fs_Pathlike } from './Path';

import { smartOperation, ArrayOrSingle, SmartOperationOptions } from '../internal';

export function copy(
  srcDirName: thalia_fs_Pathlike,
  destDirName: thalia_fs_Pathlike,
  options?: SmartOperationOptions<'newer'>,
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

export function create(dirName: thalia_fs_Pathlike, options?: SmartOperationOptions<'missing'>): boolean {
  const dirPath = thalia_fs_Path.ensure(dirName);

  return smartOperation(
    () => !dirPath.exists(),
    () => {
      thalia_log.action(`Creating directory ${dirPath}...`);
      fs.mkdirSync(dirPath.absolute(), { recursive: true });
    },
    options,
  );
}

export function createForFile(filename: thalia_fs_Pathlike, options?: SmartOperationOptions<'missing'>): boolean {
  const filePath = thalia_fs_Path.ensure(filename);
  return create(filePath.dirPath(), options);
}

export function delete_(
  potentialDirnames: ArrayOrSingle<thalia_fs_Pathlike>,
  options?: SmartOperationOptions<'exists'>,
): boolean {
  const dirPaths = thalia_fs_Path.ensureArray(potentialDirnames);
  let executed = false;

  for (const dirPath of dirPaths) {
    if (
      smartOperation(
        () => dirPath.exists(),
        () => {
          thalia_log.action(`Deleting ${dirPath}...`);
          fs.rmSync(dirPath.absolute(), { force: true, recursive: true });
        },
        options,
      )
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
