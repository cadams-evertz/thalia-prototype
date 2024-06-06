import * as fs from 'fs';

import * as thl_crypto from '../crypto';
import * as thl_if from '../if';
import * as thl_log from '../log';
import * as thl_fs_dir from './dir';
import { Path as thl_fs_Path, Pathlike as thl_fs_Pathlike } from './Path';

import { ensureArray, smartOperation, ArrayOrSingle } from '../internal';

export function copy(
  srcFilename: thl_fs_Pathlike,
  destFilename: thl_fs_Pathlike,
  options?: smartOperation.Options<{ source: thl_fs_Path; destination: thl_fs_Path }>,
): boolean {
  options = { ...{ if: thl_if.newer }, ...options };

  const srcFilePath = thl_fs_Path.ensure(srcFilename);
  const destFilePath = thl_fs_Path.ensure(destFilename);

  return smartOperation(options, { source: srcFilePath, destination: destFilePath }, () => {
    thl_log.setOptionsWhile({ action: false }, () => {
      thl_fs_dir.createForFile(destFilePath);
      });
    thl_log.action(`Copying ${srcFilePath} to ${destFilePath}...`);
      fs.copyFileSync(srcFilePath.absolute(), destFilePath.absolute());
  });
}

export function delete_(
  potentialFilenames: ArrayOrSingle<thl_fs_Pathlike>,
  options?: smartOperation.Options<thl_fs_Path>,
): boolean {
  options = { ...{ if: thl_if.exists }, ...options };

  const filePaths = thl_fs_Path.ensureArray(potentialFilenames);
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

export function different(filename1: thl_fs_Pathlike, filename2: thl_fs_Pathlike): boolean {
  const filePath1 = thl_fs_Path.ensure(filename1);
  const filePath2 = thl_fs_Path.ensure(filename2);
  return hasDifferentContents(filePath1, readText(filePath2));
}

export function find(
  filenames: ArrayOrSingle<thl_fs_Pathlike>,
  options?: { includeDirPaths?: boolean },
): thl_fs_Path[] {
  const filePaths = thl_fs_Path.ensureArray(filenames);
  return filePaths
    .map(filePath => {
      if (!filePath.exists()) {
        return [];
      } else if (filePath.stat()?.isDirectory()) {
        const children = thl_fs_dir
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

export function findUp(startPath: thl_fs_Pathlike, searchFilename: string): thl_fs_Path | undefined {
  let dirPath = thl_fs_Path.ensure(startPath);

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

export function hasDifferentContents(filename: thl_fs_Pathlike, checkContents: string): boolean {
  const filePath = thl_fs_Path.ensure(filename);
  return filePath.exists() ? checkContents !== readText(filePath) : true;
}

export function hasDifferentContentsBinary(filename: thl_fs_Pathlike, checkContents: Uint8Array): boolean {
  const filePath = thl_fs_Path.ensure(filename);

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

export function isNewer(
  filenames1: ArrayOrSingle<thl_fs_Pathlike>,
  filenames2: ArrayOrSingle<thl_fs_Pathlike>,
): boolean {
  const filePaths1 = thl_fs_Path.ensureArray(filenames1);
  const filePaths2 = thl_fs_Path.ensureArray(filenames2);
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
  saveFilename?: thl_fs_Pathlike;
  saveExtension?: string;
}

export function checksum(
  filename: thl_fs_Pathlike,
  checksumFunc: (data: string | Buffer) => string,
  options?: ChecksumOptions,
): string {
  const filePath = thl_fs_Path.ensure(filename);
  const contents = read(filePath);
  const checksum = checksumFunc(contents);

  if (options?.save || options?.saveFilename) {
    const saveFilePath = options?.saveFilename
      ? thl_fs_Path.ensure(options.saveFilename)
      : filePath.append(options?.saveExtension || '.checksum');
    writeText(saveFilePath, checksum);
  }

  return checksum;
}

export function md5sum(filename: thl_fs_Pathlike, options?: ChecksumOptions): string {
  return checksum(filename, thl_crypto.md5sum, { saveExtension: '.md5', ...options });
}

export function sha256sum(filename: thl_fs_Pathlike, options?: ChecksumOptions): string {
  return checksum(filename, thl_crypto.sha256sum, { saveExtension: '.sha256', ...options });
}

export interface MulticopyOperation {
  src: ArrayOrSingle<thl_fs_Pathlike>;
  dest: thl_fs_Pathlike;
}

export function multiCopy(
  operations: MulticopyOperation[],
  options?: smartOperation.Options<{ source: thl_fs_Path; destination: thl_fs_Path }>,
): boolean {
  let executed = false;

  for (const operation of operations) {
    const destPath = thl_fs_Path.ensure(operation.dest);

    for (const sourceName of ensureArray(operation.src)) {
      const srcPath = thl_fs_Path.ensure(sourceName);

      if (srcPath.isDirectory()) {
        executed = thl_fs_dir.copy(srcPath, destPath, options) || executed;
      } else {
        executed = copy(srcPath, destPath, options) || executed;
      }
    }
  }

  return executed;
}

export function newest(filenames: ArrayOrSingle<thl_fs_Pathlike>): Date | undefined {
  const filePaths = thl_fs_Path.ensureArray(filenames);
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

export function oldest(filenames: ArrayOrSingle<thl_fs_Pathlike>): Date | undefined {
  const filePaths = thl_fs_Path.ensureArray(filenames);
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

export function read(filename: thl_fs_Pathlike): Buffer {
  const filePath = thl_fs_Path.ensure(filename);
  return fs.readFileSync(filePath.absolute());
}

export function readBinary(filename: thl_fs_Pathlike): Uint8Array {
  return new Uint8Array(read(filename));
}

export function readJson(filename: thl_fs_Pathlike): any {
  return JSON.parse(readText(filename));
}

export function readText(filename: thl_fs_Pathlike): string {
  return read(filename).toString();
}

export function writeBinary(
  filename: thl_fs_Pathlike,
  data: Uint8Array,
  options?: smartOperation.Options<{ path: thl_fs_Path; data: Uint8Array }>,
): void {
  options = { ...{ if: thl_if.differentContentsBinary }, ...options };

  const filePath = thl_fs_Path.ensure(filename);

  smartOperation(options, { path: filePath, data }, () => {
    thl_log.action(`Saving ${filePath}...`);
    thl_log.setOptionsWhile({ action: false }, () => {
      thl_fs_dir.createForFile(filePath);
      });
      fs.writeFileSync(filePath.absolute(), data);
  });
}

export function writeJson(
  filename: thl_fs_Pathlike,
  data: any,
  options?: {
    crlfLineEndings?: boolean;
  } & smartOperation.Options<{ path: thl_fs_Path; data: string }>,
): void {
  const filePath = thl_fs_Path.ensure(filename);
  writeText(filePath, JSON.stringify(data, undefined, '  '), options);
}

export function writeText(
  filename: thl_fs_Pathlike,
  data: string,
  options?: {
    crlfLineEndings?: boolean;
  } & smartOperation.Options<{ path: thl_fs_Path; data: string }>,
): void {
  options = { ...{ if: thl_if.differentContents }, ...options };
  const filePath = thl_fs_Path.ensure(filename);

  if (options?.crlfLineEndings) {
    data = data.replace(/\n/g, '\r\n');
  }

  smartOperation(options, { path: filePath, data }, () => {
    thl_log.action(`Saving ${filePath}...`);
    thl_log.setOptionsWhile({ action: false }, () => {
      thl_fs_dir.createForFile(filePath);
      });
      fs.writeFileSync(filePath.absolute(), data);
  });
}
