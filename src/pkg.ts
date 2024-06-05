import axios from 'axios';
// @ts-ignore - No types available?
import * as JsZipSync from 'jszip-sync';
import * as tar_ from 'tar';

import * as thalia_fs from './fs';
import * as thalia_if from './if';
import * as thalia_log from './log';
import * as thalia_platform from './platform';
import * as thalia_process from './process';
import { ArrayOrSingle, smartOperation } from './internal';

export function createZip(zipFilename: thalia_fs.Pathlike, arg: (zip: JsZipSync) => void): void {
  const zipFilePath = thalia_fs.Path.ensure(zipFilename);
  thalia_log.action(`Creating package ${zipFilePath}...`);
  const zip = new JsZipSync();
  const data = zip.sync(() => {
    arg(zip);
    let data: Uint8Array | undefined = undefined;
    zip.generateAsync({ compression: 'DEFLATE', type: 'uint8array' }).then((data_: Uint8Array) => {
      data = data_;
    });
    return data;
  });
  thalia_fs.file.writeBinary(zipFilePath.absolute(), data);
}

export interface DebOptions {
  name: string;
  version: string;
  maintainer: string;
  description: string;
  architecture?: string;
}

export function deb(
  debDirName: thalia_fs.Pathlike,
  debOptions: DebOptions,
  options?: smartOperation.Options<{ source: thalia_fs.Path; destination: thalia_fs.Path }>,
): boolean {
  options = { ...{ if: thalia_if.newer }, ...options };

  const debDirPath = thalia_fs.Path.ensure(debDirName);
  const debFilePath = debDirPath.append('.deb');

  return smartOperation(options, { source: debDirPath, destination: debFilePath }, () => {
    const debianDirPath = debDirPath.joinWith('DEBIAN');
    const controlFilePath = debianDirPath.joinWith('control');

    const controlContents = `Package: ${debOptions.name}
Version: ${debOptions.version}
Maintainer: ${debOptions.maintainer}
Architecture: ${debOptions.architecture ?? 'all'}
Description: ${debOptions.description}
`;
    thalia_log.setOptionsWhile({ action: false }, () => {
      thalia_fs.file.writeText(controlFilePath, controlContents, {
        if: options?.if === thalia_if.always ? thalia_if.always : undefined,
      });
    });

    thalia_log.action(`Creating package ${debFilePath}...`);
    thalia_process.execute(`dpkg-deb --build ${debDirPath}`);
  });
}

export interface MultipackageOptions extends DebOptions {
  company?: string;
  contents: thalia_fs.file.MulticopyOperation[];
  deb?: boolean;
  includePlatformCodename?: boolean;
  installToDir?: thalia_fs.Pathlike;
  md5?: boolean;
  outputDirName: thalia_fs.Pathlike;
  sha256?: boolean;
  tarGz?: boolean;
  zip?: boolean;
}

export function multipackage(options: MultipackageOptions): thalia_fs.Path[] {
  const packageFilePaths: thalia_fs.Path[] = [];
  let debRootName = `${options.name}-${options.version}`;

  if (options.includePlatformCodename) {
    debRootName = `${debRootName}-${thalia_platform.codename()}`;
  }

  const installToDir = options.installToDir ?? (options.company ? `opt/${options.company}/${options.name}` : '');
  const outputDirPath = thalia_fs.Path.ensure(options.outputDirName);
  const debRootPath = outputDirPath.joinWith(debRootName);
  const debFilesPath = debRootPath.joinWith(installToDir.toString());
  const contents = options.contents.map(operation => ({
    src: thalia_fs.Path.ensureArray(operation.src),
    dest: operation.dest instanceof thalia_fs.Path ? operation.dest : debFilesPath.joinWith(operation.dest),
  }));

  thalia_fs.file.multiCopy(contents);

  if (thalia_platform.linux() && options.deb) {
    const debFilePath = debRootPath.append('.deb');
    deb(debRootPath, options);
    packageFilePaths.push(debFilePath);
    packageFilePaths.push(...checksum(debFilePath, options));
  }

  if (options.tarGz) {
    const tarFilePath = outputDirPath.joinWith(`${debRootName}.tar.gz`);
    tar(tarFilePath, debFilesPath);
    packageFilePaths.push(tarFilePath);
    packageFilePaths.push(...checksum(tarFilePath, options));
  }

  if (options.zip) {
    const zipFilePath = outputDirPath.joinWith(`${debRootName}.zip`);
    zip(zipFilePath, debFilesPath);
    packageFilePaths.push(zipFilePath);
    packageFilePaths.push(...checksum(zipFilePath, options));
  }

  return packageFilePaths;
}

export function tar(
  tarFilename: thalia_fs.Pathlike,
  dirName: thalia_fs.Pathlike,
  options?: smartOperation.Options<{ source: ArrayOrSingle<thalia_fs.Path>; destination: thalia_fs.Path }>,
): boolean {
  options = { ...{ if: thalia_if.newer }, ...options };

  const tarFilePath = thalia_fs.Path.ensure(tarFilename);
  const dirPath = thalia_fs.Path.ensure(dirName);

  return smartOperation(options, { source: thalia_fs.file.find(dirPath), destination: tarFilePath }, () => {
    thalia_log.action(`Creating package ${tarFilePath}...`);
    const gzip = tarFilePath.endsWith('.gz');
    tar_.create({ gzip, file: tarFilePath.absolute(), sync: true, cwd: dirPath.absolute() }, ['.']);
  });
}

export function untar(tarFilename: thalia_fs.Pathlike, extractDirName: thalia_fs.Pathlike): void {
  const tarFilePath = thalia_fs.Path.ensure(tarFilename);
  const extractDirPath = thalia_fs.Path.ensure(extractDirName);

  thalia_log.action(`Extracting package ${tarFilePath} to ${extractDirPath}...`);
  thalia_log.setOptionsWhile({ action: false }, () => {
    thalia_fs.dir.create(extractDirPath);
  });
  tar_.extract({ file: tarFilePath.absolute(), sync: true, cwd: extractDirPath.absolute() });
}

export async function unzip(zipFilename: thalia_fs.Pathlike, extractDirName: thalia_fs.Pathlike): Promise<void> {
  const extractDirPath = thalia_fs.Path.ensure(extractDirName);

  thalia_log.action(`Extracting package ${zipFilename} to ${extractDirPath}...`);

  const potentialUrl = `${zipFilename}`;
  let zipData: Uint8Array;

  if (potentialUrl.startsWith('http://')) {
    zipData = (await axios.get(potentialUrl, { responseType: 'arraybuffer' })).data;
  } else {
    const zipFilePath = thalia_fs.Path.ensure(zipFilename);
    zipData = thalia_fs.file.readBinary(zipFilePath);
  }

  const zip = await new JsZipSync().loadAsync(zipData);

  for (const unknownEntry of Object.values(zip.files)) {
    const entry = unknownEntry as any;

    if (!entry.dir) {
      const fileData = await entry.async('uint8array');
      const extractFilePath = extractDirPath.joinWith(entry.name);

      thalia_fs.file.writeBinary(extractFilePath, fileData);
    }
  }
}

export function zip(
  zipFilename: thalia_fs.Pathlike,
  dirName: thalia_fs.Pathlike,
  options?: smartOperation.Options<{ source: ArrayOrSingle<thalia_fs.Path>; destination: thalia_fs.Path }>,
): boolean {
  options = { ...{ if: thalia_if.newer }, ...options };

  const zipFilePath = thalia_fs.Path.ensure(zipFilename);
  const dirPath = thalia_fs.Path.ensure(dirName);

  return smartOperation(options, { source: thalia_fs.file.find(dirPath), destination: zipFilePath }, () => {
    const walk = (zip: JsZipSync, dirPath: thalia_fs.Path) => {
      for (const path of thalia_fs.dir.read(dirPath)) {
        if (path.isDirectory()) {
          walk(zip.folder(path.relativeTo(dirPath)), path);
        } else {
          zip.file(path.relativeTo(dirPath), thalia_fs.file.readBinary(path));
        }
      }
    };

    createZip(zipFilePath, zip => {
      walk(zip, dirPath);
    });
  });
}

function checksum(filePath: thalia_fs.Path, options: { md5?: boolean; sha256?: boolean }): thalia_fs.Path[] {
  const checksumFilePaths: thalia_fs.Path[] = [];

  if (options.md5) {
    thalia_fs.file.md5sum(filePath, { save: true });
    checksumFilePaths.push(filePath.append('.md5'));
  }

  if (options.sha256) {
    thalia_fs.file.sha256sum(filePath, { save: true });
    checksumFilePaths.push(filePath.append('.sha256'));
  }

  return checksumFilePaths;
}
