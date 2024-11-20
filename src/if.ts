import * as thl_fs from './fs';
import * as thl_util from './util';

export function always(): boolean {
  return true;
}

export function differentContents({ path, data }: { path: thl_fs.Path; data: string }): boolean {
  return thl_fs.file.hasDifferentContents(path, data);
}

export function differentContentsBinary({ path, data }: { path: thl_fs.Path; data: Uint8Array }): boolean {
  return thl_fs.file.hasDifferentContentsBinary(path, data);
}

export function doesNotExist(path: thl_fs.Path): boolean {
  return !path.exists();
}

export function exists(path: thl_fs.Path): boolean {
  return path.exists();
}

export function newer({
  source,
  destination,
}: {
  source: thl_util.ArrayOrSingle<thl_fs.Path>;
  destination: thl_fs.Path;
}): boolean {
  return thl_fs.file.isNewer(source, destination);
}
