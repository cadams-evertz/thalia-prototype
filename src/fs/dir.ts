import * as fs from 'fs';

import * as thl_if from '../if';
import * as thl_log from '../log';
import * as thl_fs_file from './file';
import { Path as thl_fs_Path, Pathlike as thl_fs_Pathlike } from './Path';

import { ArrayOrSingle, smartOperation } from '../internal';

export function copy(
  srcDirName: thl_fs_Pathlike,
  destDirName: thl_fs_Pathlike,
  options?: smartOperation.Options<{ source: thl_fs_Path; destination: thl_fs_Path }>,
): boolean {
  const srcDirPath = thl_fs_Path.ensure(srcDirName);
  const destDirPath = thl_fs_Path.ensure(destDirName);
  let executed = false;

  for (const srcFilePath of thl_fs_file.find(srcDirPath)) {
    const destFilePath = destDirPath.joinWith(srcFilePath.relativeTo(srcDirPath));
    executed = thl_fs_file.copy(srcFilePath, destFilePath, options) || executed;
  }

  return executed;
}

export function create(dirName: thl_fs_Pathlike, options?: smartOperation.Options<thl_fs_Path>): boolean {
  options = { ...{ if: thl_if.doesNotExist }, ...options };

  const dirPath = thl_fs_Path.ensure(dirName);

  return smartOperation<thl_fs_Path>(options, dirPath, () => {
    thl_log.action(`Creating directory ${dirPath}...`);
      fs.mkdirSync(dirPath.absolute(), { recursive: true });
  });
}

export function createForFile(filename: thl_fs_Pathlike, options?: smartOperation.Options<thl_fs_Path>): boolean {
  const filePath = thl_fs_Path.ensure(filename);
  return create(filePath.dirPath(), options);
}

export function delete_(
  potentialDirnames: ArrayOrSingle<thl_fs_Pathlike>,
  options?: smartOperation.Options<thl_fs_Path>,
): boolean {
  options = { ...{ if: thl_if.exists }, ...options };

  const dirPaths = thl_fs_Path.ensureArray(potentialDirnames);
  let executed = false;

  for (const dirPath of dirPaths) {
    if (
      smartOperation(options, dirPath, () => {
        thl_log.action(`Deleting ${dirPath}...`);
          fs.rmSync(dirPath.absolute(), { force: true, recursive: true });
      })
    ) {
      executed = true;
    }
  }

  return executed;
}

export function getCurrent(): thl_fs_Path {
  return new thl_fs_Path(process.cwd());
}

export function read(dirName: thl_fs_Pathlike): thl_fs_Path[] {
  const dirPath = thl_fs_Path.ensure(dirName);
  return fs.readdirSync(dirPath.absolute()).map(filename => new thl_fs_Path(filename, dirPath));
}

export function setCurrent(dirName: thl_fs_Pathlike): void {
  const dirPath = thl_fs_Path.ensure(dirName);
  process.chdir(dirPath.absolute());
}

export function setCurrentWhile(dirName: thl_fs_Pathlike, work: () => void): void {
  const oldCurrent = getCurrent();
  try {
    setCurrent(dirName);
    work();
  } finally {
    setCurrent(oldCurrent);
  }
}
