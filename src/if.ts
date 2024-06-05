import * as thalia_fs from './fs';
import { ArrayOrSingle } from './internal';

export function always(): boolean {
  return true;
}

export function differentContents({ path, data }: { path: thalia_fs.Path; data: string }): boolean {
  return thalia_fs.file.hasDifferentContents(path, data);
}

export function differentContentsBinary({ path, data }: { path: thalia_fs.Path; data: Uint8Array }): boolean {
  return thalia_fs.file.hasDifferentContentsBinary(path, data);
}

export function doesNotExist(path: thalia_fs.Path): boolean {
  return !path.exists();
}

export function exists(path: thalia_fs.Path): boolean {
  return path.exists();
}

export function newer({
  source,
  destination,
}: {
  source: ArrayOrSingle<thalia_fs.Path>;
  destination: thalia_fs.Path;
}): boolean {
  return thalia_fs.file.isNewer(source, destination);
}
