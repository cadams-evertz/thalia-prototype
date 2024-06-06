import axios from 'axios';
import * as JsZip from 'jszip';
import * as tar_ from 'tar';

import * as thl_fs from './fs';
import * as thl_if from './if';
import * as thl_log from './log';
import * as thl_platform from './platform';
import * as thl_process from './process';
import { ArrayOrSingle, asyncSmartOperation, smartOperation } from './internal';

export async function createZip(zipFilename: thl_fs.Pathlike, arg: (zip: JsZip) => void): Promise<void> {
  const zipFilePath = thl_fs.Path.ensure(zipFilename);
  thl_log.action(`Creating package ${zipFilePath}...`);
  const zip = new JsZip();
  arg(zip);
  const data = await zip.generateAsync({ compression: 'DEFLATE', type: 'uint8array' });
  thl_fs.file.writeBinary(zipFilePath.absolute(), data);
}

export interface DebOptions {
  name: string;
  version: string;
  maintainer: string;
  description: string;
  architecture?: string;
}

export function deb(
  debDirName: thl_fs.Pathlike,
  debOptions: DebOptions,
  options?: smartOperation.Options<{ source: thl_fs.Path; destination: thl_fs.Path }>,
): boolean {
  options = { ...{ if: thl_if.newer }, ...options };

  const debDirPath = thl_fs.Path.ensure(debDirName);
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
    thl_log.setOptionsWhile({ action: false }, () => {
      thl_fs.file.writeText(controlFilePath, controlContents, {
        if: options?.if === thl_if.always ? thl_if.always : undefined,
      });
    });

    thl_log.action(`Creating package ${debFilePath}...`);
    thl_process.execute(`dpkg-deb --build ${debDirPath}`);
  });
}

export interface MultipackageOptions extends DebOptions {
  company?: string;
  contents: thl_fs.file.MulticopyOperation[];
  deb?: boolean;
  includePlatformCodename?: boolean;
  installToDir?: thl_fs.Pathlike;
  md5?: boolean;
  outputDirName: thl_fs.Pathlike;
  sha256?: boolean;
  tarGz?: boolean;
  zip?: boolean;
}

export function multipackage(options: MultipackageOptions): thl_fs.Path[] {
  const packageFilePaths: thl_fs.Path[] = [];
  let debRootName = `${options.name}-${options.version}`;

  if (options.includePlatformCodename) {
    debRootName = `${debRootName}-${thl_platform.codename()}`;
  }

  const installToDir = options.installToDir ?? (options.company ? `opt/${options.company}/${options.name}` : '');
  const outputDirPath = thl_fs.Path.ensure(options.outputDirName);
  const debRootPath = outputDirPath.joinWith(debRootName);
  const debFilesPath = debRootPath.joinWith(installToDir.toString());
  const contents = options.contents.map(operation => ({
    src: thl_fs.Path.ensureArray(operation.src),
    dest: operation.dest instanceof thl_fs.Path ? operation.dest : debFilesPath.joinWith(operation.dest),
  }));

  thl_fs.file.multiCopy(contents);

  if (thl_platform.linux() && options.deb) {
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
  tarFilename: thl_fs.Pathlike,
  dirName: thl_fs.Pathlike,
  options?: smartOperation.Options<{ source: ArrayOrSingle<thl_fs.Path>; destination: thl_fs.Path }>,
): boolean {
  options = { ...{ if: thl_if.newer }, ...options };

  const tarFilePath = thl_fs.Path.ensure(tarFilename);
  const dirPath = thl_fs.Path.ensure(dirName);

  return smartOperation(options, { source: thl_fs.file.find(dirPath), destination: tarFilePath }, () => {
    thl_log.action(`Creating package ${tarFilePath}...`);
    const gzip = tarFilePath.endsWith('.gz');
    tar_.create({ gzip, file: tarFilePath.absolute(), sync: true, cwd: dirPath.absolute() }, ['.']);
  });
}

export function untar(tarFilename: thl_fs.Pathlike, extractDirName: thl_fs.Pathlike): void {
  const tarFilePath = thl_fs.Path.ensure(tarFilename);
  const extractDirPath = thl_fs.Path.ensure(extractDirName);

  thl_log.action(`Extracting package ${tarFilePath} to ${extractDirPath}...`);
  thl_log.setOptionsWhile({ action: false }, () => {
    thl_fs.dir.create(extractDirPath);
  });
  tar_.extract({ file: tarFilePath.absolute(), sync: true, cwd: extractDirPath.absolute() });
}

export async function unzip(zipFilename: thl_fs.Pathlike, extractDirName: thl_fs.Pathlike): Promise<void> {
  const extractDirPath = thl_fs.Path.ensure(extractDirName);

  thl_log.action(`Extracting package ${zipFilename} to ${extractDirPath}...`);

  const potentialUrl = `${zipFilename}`;
  let zipData: Uint8Array;

  if (potentialUrl.startsWith('http://')) {
    zipData = (await axios.get(potentialUrl, { responseType: 'arraybuffer' })).data;
  } else {
    const zipFilePath = thl_fs.Path.ensure(zipFilename);
    zipData = thl_fs.file.readBinary(zipFilePath);
  }

  const zip = await new JsZip().loadAsync(zipData);

  for (const unknownEntry of Object.values(zip.files)) {
    const entry = unknownEntry as any;

    if (!entry.dir) {
      const fileData = await entry.async('uint8array');
      const extractFilePath = extractDirPath.joinWith(entry.name);

      thl_fs.file.writeBinary(extractFilePath, fileData);
    }
  }
}

export async function zip(
  zipFilename: thl_fs.Pathlike,
  dirName: thl_fs.Pathlike,
  options?: smartOperation.Options<{ source: ArrayOrSingle<thl_fs.Path>; destination: thl_fs.Path }>,
): Promise<boolean> {
  options = { ...{ if: thl_if.newer }, ...options };

  const zipFilePath = thl_fs.Path.ensure(zipFilename);
  const dirPath = thl_fs.Path.ensure(dirName);

  return asyncSmartOperation(options, { source: thl_fs.file.find(dirPath), destination: zipFilePath }, async () => {
    const walk = (zip: JsZip, dirPath: thl_fs.Path) => {
      for (const path of thl_fs.dir.read(dirPath)) {
        if (path.isDirectory()) {
          walk(zip.folder(path.relativeTo(dirPath)), path);
        } else {
          zip.file(path.relativeTo(dirPath), thl_fs.file.readBinary(path));
        }
      }
    };

    await createZip(zipFilePath, zip => {
      walk(zip, dirPath);
    });
  });
}

function checksum(filePath: thl_fs.Path, options: { md5?: boolean; sha256?: boolean }): thl_fs.Path[] {
  const checksumFilePaths: thl_fs.Path[] = [];

  if (options.md5) {
    thl_fs.file.md5sum(filePath, { save: true });
    checksumFilePaths.push(filePath.append('.md5'));
  }

  if (options.sha256) {
    thl_fs.file.sha256sum(filePath, { save: true });
    checksumFilePaths.push(filePath.append('.sha256'));
  }

  return checksumFilePaths;
}
