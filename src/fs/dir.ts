import * as fs from 'fs';

import * as thl_if from '../if';
import * as thl_log from '../log';
import * as file from './file';
import { Path, Pathlike } from './Path';

import { ArrayOrSingle, smartOperation } from '../internal';

export function chmodRecursive(dirName: Pathlike, mode: fs.Mode | ((path: Path) => fs.Mode)): void {
  for (const path of walk(dirName, { includeDirectories: true })) {
    file.chmod(path, typeof mode === 'function' ? mode(path) : mode);
  }
}

export function copy(
  srcDirName: Pathlike,
  destDirName: Pathlike,
  options?: smartOperation.Options<{ source: Path; destination: Path }>,
): boolean {
  const srcDirPath = Path.ensure(srcDirName);
  const destDirPath = Path.ensure(destDirName);
  let executed = false;

  for (const srcFilePath of file.find(srcDirPath)) {
    const destFilePath = destDirPath.joinWith(srcFilePath.relativeTo(srcDirPath));
    executed = file.copy(srcFilePath, destFilePath, options) || executed;
  }

  return executed;
}

export function create(dirName: Pathlike, options?: smartOperation.Options<Path>): boolean {
  options = { ...{ if: thl_if.doesNotExist }, ...options };

  const dirPath = Path.ensure(dirName);

  return smartOperation<Path>(options, dirPath, () => {
    thl_log.action(`Creating directory ${dirPath}...`);
    fs.mkdirSync(dirPath.absolute(), { recursive: true });
  });
}

export function createForFile(filename: Pathlike, options?: smartOperation.Options<Path>): boolean {
  const filePath = Path.ensure(filename);
  return create(filePath.dirPath(), options);
}

export function getCurrent(): Path {
  return new Path(process.cwd());
}

export function read(dirName: Pathlike): Path[] {
  const dirPath = Path.ensure(dirName);
  return fs.readdirSync(dirPath.absolute()).map(filename => new Path(filename, dirPath));
}

export function remove(potentialDirnames: ArrayOrSingle<Pathlike>, options?: smartOperation.Options<Path>): boolean {
  options = { ...{ if: thl_if.exists }, ...options };

  const dirPaths = Path.ensureArray(potentialDirnames);
  let executed = false;

  for (const dirPath of dirPaths) {
    if (
      smartOperation(options, dirPath, () => {
        thl_log.action(`Removing ${dirPath}...`);
        fs.rmSync(dirPath.absolute(), { force: true, recursive: true });
      })
    ) {
      executed = true;
    }
  }

  return executed;
}

export function setCurrent(dirName: Pathlike): void {
  const dirPath = Path.ensure(dirName);
  process.chdir(dirPath.absolute());
}

export function setCurrentWhile<T>(dirName: Pathlike, work: () => T): T {
  const oldCurrent = getCurrent();
  try {
    setCurrent(dirName);
    return work();
  } finally {
    setCurrent(oldCurrent);
  }
}

export function* walk(dirName: Pathlike, options?: { includeDirectories?: boolean }): Generator<Path> {
  const dirPath = Path.ensure(dirName);
  const dir = fs.opendirSync(dirPath.absolute());

  while (true) {
    const dirEnt = dir.readSync();

    if (!dirEnt) {
      break;
    }

    const itemPath = dirPath.joinWith(dirEnt.name);

    if (dirEnt.isDirectory()) {
      if (options?.includeDirectories) {
        yield itemPath;
      }

      yield* walk(itemPath, options);
    } else if (dirEnt.isFile()) {
      yield itemPath;
    }
  }

  dir.closeSync();
}
