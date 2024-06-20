import * as fs from 'fs';

import * as thl_crypto from '../crypto';
import * as thl_if from '../if';
import * as thl_log from '../log';

import * as dir from './dir';
import { Path, Pathlike } from './Path';

import { ensureArray, smartOperation, ArrayOrSingle } from '../internal';

export function copy(
  srcFilename: Pathlike,
  destFilename: Pathlike,
  options?: smartOperation.Options<{ source: Path; destination: Path }>,
): boolean {
  options = { ...{ if: thl_if.newer }, ...options };

  const srcFilePath = Path.ensure(srcFilename);
  const destFilePath = Path.ensure(destFilename);

  return smartOperation(options, { source: srcFilePath, destination: destFilePath }, () => {
    thl_log.setOptionsWhile({ action: false }, () => {
      dir.createForFile(destFilePath);
    });
    thl_log.action(`Copying ${srcFilePath} to ${destFilePath}...`);
    fs.copyFileSync(srcFilePath.absolute(), destFilePath.absolute());
  });
}

export function delete_(potentialFilenames: ArrayOrSingle<Pathlike>, options?: smartOperation.Options<Path>): boolean {
  options = { ...{ if: thl_if.exists }, ...options };

  const filePaths = Path.ensureArray(potentialFilenames);
  let executed = false;

  for (const filePath of filePaths) {
    executed =
      smartOperation(options, filePath, () => {
        thl_log.action(`Deleting ${filePath}...`);
        fs.rmSync(filePath.absolute(), { force: true });
      }) || executed;
  }

  return executed;
}

export function different(filename1: Pathlike, filename2: Pathlike): boolean {
  const filePath1 = Path.ensure(filename1);
  const filePath2 = Path.ensure(filename2);
  return hasDifferentContents(filePath1, readText(filePath2));
}

export function find(filenames: ArrayOrSingle<Pathlike>, options?: { includeDirPaths?: boolean }): Path[] {
  const filePaths = Path.ensureArray(filenames);
  return filePaths
    .map(filePath => {
      if (!filePath.exists()) {
        return [];
      } else if (filePath.stat()?.isDirectory()) {
        const children = dir
          .read(filePath)
          .map(childFilePath => find(childFilePath, options))
          .flat();
        return options?.includeDirPaths ? [filePath, ...children] : children;
      } else {
        return filePath;
      }
    })
    .flat();
}

export function findUp(startPath: Pathlike, searchFilename: string): Path | undefined {
  let dirPath = Path.ensure(startPath);

  while (true) {
    const searchPath = dirPath.joinWith(searchFilename);

    if (searchPath.exists()) {
      return searchPath;
    } else {
      const parentPath = dirPath.dirPath();

      if (parentPath.absolute() === dirPath.absolute()) {
        return undefined;
      } else {
        dirPath = parentPath;
      }
    }
  }
}

export function hasDifferentContents(filename: Pathlike, checkContents: string): boolean {
  const filePath = Path.ensure(filename);
  return filePath.exists() ? checkContents !== readText(filePath) : true;
}

export function hasDifferentContentsBinary(filename: Pathlike, checkContents: Uint8Array): boolean {
  const filePath = Path.ensure(filename);

  if (filePath.exists()) {
    const existingContents = readBinary(filePath);

    if (checkContents.length !== existingContents.length) {
      return true;
    } else {
      for (let index = 0; index < checkContents.length; index++) {
        if (checkContents[index] !== existingContents[index]) {
          return true;
        }
      }

      return false;
    }
  } else {
    return true;
  }
}

export function isNewer(filenames1: ArrayOrSingle<Pathlike>, filenames2: ArrayOrSingle<Pathlike>): boolean {
  const filePaths1 = Path.ensureArray(filenames1);
  const filePaths2 = Path.ensureArray(filenames2);
  const newest1 = newest(filePaths1);
  const newest2 = newest(filePaths2);

  if (!newest1) {
    return false;
  } else if (!newest2) {
    return true;
  } else {
    return newest1.getTime() > newest2.getTime();
  }
}

export interface ChecksumOptions {
  save?: boolean;
  saveFilename?: Pathlike;
  saveExtension?: string;
}

export function checksum(
  filename: Pathlike,
  checksumFunc: (data: string | Buffer) => string,
  options?: ChecksumOptions,
): string {
  const filePath = Path.ensure(filename);
  const contents = read(filePath);
  const checksum = checksumFunc(contents);

  if (options?.save || options?.saveFilename) {
    const saveFilePath = options?.saveFilename
      ? Path.ensure(options.saveFilename)
      : filePath.append(options?.saveExtension || '.checksum');
    writeText(saveFilePath, checksum);
  }

  return checksum;
}

export function chmod(filename: Pathlike, mode: fs.Mode): void {
  const filePath = Path.ensure(filename);
  fs.chmodSync(filePath.absolute(), mode);
}

export function md5sum(filename: Pathlike, options?: ChecksumOptions): string {
  return checksum(filename, thl_crypto.md5sum, { saveExtension: '.md5', ...options });
}

export function sha256sum(filename: Pathlike, options?: ChecksumOptions): string {
  return checksum(filename, thl_crypto.sha256sum, { saveExtension: '.sha256', ...options });
}

export interface MulticopyOperation {
  src: ArrayOrSingle<Pathlike>;
  dest: Pathlike;
}

export function multiCopy(
  operations: MulticopyOperation[],
  options?: smartOperation.Options<{ source: Path; destination: Path }>,
): boolean {
  let executed = false;

  for (const operation of operations) {
    const destPath = Path.ensure(operation.dest);

    for (const sourceName of ensureArray(operation.src)) {
      const srcPath = Path.ensure(sourceName);

      if (srcPath.isDirectory()) {
        executed = dir.copy(srcPath, destPath, options) || executed;
      } else {
        executed = copy(srcPath, destPath, options) || executed;
      }
    }
  }

  return executed;
}

export function newest(filenames: ArrayOrSingle<Pathlike>): Date | undefined {
  const filePaths = Path.ensureArray(filenames);
  const children = find(filePaths);

  return children.reduce<Date | undefined>((previousTimestamp, filePath) => {
    const timestamp = filePath.stat()?.mtime;

    if (!timestamp) {
      return previousTimestamp;
    } else if (!previousTimestamp) {
      return timestamp;
    } else {
      return timestamp.getTime() > previousTimestamp.getTime() ? timestamp : previousTimestamp;
    }
  }, undefined);
}

export function oldest(filenames: ArrayOrSingle<Pathlike>): Date | undefined {
  const filePaths = Path.ensureArray(filenames);
  const children = find(filePaths);

  return children.reduce<Date | undefined>((previousTimestamp, filePath) => {
    const timestamp = filePath.stat()?.mtime;

    if (!timestamp) {
      return previousTimestamp;
    } else if (!previousTimestamp) {
      return timestamp;
    } else {
      return timestamp.getTime() < previousTimestamp.getTime() ? timestamp : previousTimestamp;
    }
  }, undefined);
}

export function read(filename: Pathlike): Buffer {
  const filePath = Path.ensure(filename);
  return fs.readFileSync(filePath.absolute());
}

export function readBinary(filename: Pathlike): Uint8Array {
  return new Uint8Array(read(filename));
}

export function readJson(filename: Pathlike): any {
  return JSON.parse(readText(filename));
}

export function readText(filename: Pathlike): string {
  return read(filename).toString();
}

export function rename(srcFilename: Pathlike, destFilename: Pathlike): void {
  const srcFilePath = Path.ensure(srcFilename);
  const destFilePath = Path.ensure(destFilename);

  thl_log.action(`Renaming ${srcFilePath} to ${destFilePath}...`);
  fs.renameSync(srcFilePath.absolute(), destFilePath.absolute());
}

export function writeBinary(
  filename: Pathlike,
  data: Uint8Array,
  options?: smartOperation.Options<{ path: Path; data: Uint8Array }>,
): boolean {
  options = { ...{ if: thl_if.differentContentsBinary }, ...options };

  const filePath = Path.ensure(filename);

  return smartOperation(options, { path: filePath, data }, () => {
    thl_log.action(`Saving ${filePath}...`);
    thl_log.setOptionsWhile({ action: false }, () => {
      dir.createForFile(filePath);
    });
    fs.writeFileSync(filePath.absolute(), data);
  });
}

export function writeJson(
  filename: Pathlike,
  data: any,
  options?: {
    crlfLineEndings?: boolean;
  } & smartOperation.Options<{ path: Path; data: string }>,
): boolean {
  const filePath = Path.ensure(filename);
  return writeText(filePath, JSON.stringify(data, undefined, '  '), options);
}

export function writeText(
  filename: Pathlike,
  data: string,
  options?: {
    crlfLineEndings?: boolean;
  } & smartOperation.Options<{ path: Path; data: string }>,
): boolean {
  options = { ...{ if: thl_if.differentContents }, ...options };
  const filePath = Path.ensure(filename);

  if (options?.crlfLineEndings) {
    data = data.replace(/\n/g, '\r\n');
  }

  return smartOperation(options, { path: filePath, data }, () => {
    thl_log.action(`Saving ${filePath}...`);
    thl_log.setOptionsWhile({ action: false }, () => {
      dir.createForFile(filePath);
    });
    fs.writeFileSync(filePath.absolute(), data);
  });
}
