import * as fs from 'fs';
import * as path from 'path';

import * as thl_util from '../util';

import * as dir from './dir';

export class Path {
  private static readonly ABSOLUTE_PATH_REGEX = /(\/[a-zA-Z0-9_\-\.]+)+/;
  private static readonly HTTP_REGEX = /http(s)?:\/$/;
  private static readonly PORT_REGEX = /:[0-9]+$/;

  private _absolute: string;

  constructor(filename: string, relativeTo?: Path) {
    this._absolute = this.resolve(filename, relativeTo);
  }

  public absolute(): string {
    return this._absolute;
  }

  public append(suffix: string): Path {
    return new Path(this._absolute + suffix);
  }

  public basename(ext?: string): string {
    return path.basename(this._absolute, ext);
  }

  public changeExtension(extension: string): Path {
    const basename = path.basename(this._absolute, path.extname(this._absolute));
    return this.dirPath().joinWith(basename + extension);
  }

  public dirPath(): Path {
    return new Path(path.dirname(this._absolute));
  }

  public endsWith(suffix: string): boolean {
    return this._absolute.endsWith(suffix);
  }

  public static ensure(pathlike: Pathlike, relativeTo?: Path): Path {
    return pathlike instanceof Path ? pathlike : new Path(pathlike, relativeTo);
  }

  public static ensureArray(pathlikes: thl_util.ArrayOrSingle<Pathlike>, relativeTo?: Path): Path[] {
    pathlikes = thl_util.ensureArray(pathlikes);
    return pathlikes.map(pathlike => Path.ensure(pathlike, relativeTo));
  }

  public exists(): boolean {
    return fs.existsSync(this._absolute);
  }

  public isDirectory(): boolean {
    return fs.lstatSync(this._absolute).isDirectory();
  }

  public joinWith(...bits: string[]): Path {
    return new Path(path.join(...[this._absolute, ...bits]));
  }

  public static pushAllIfUnique(array: Path[], newItems: Path[]): void {
    thl_util.pushAllIfUnique(
      array,
      newItems,
      (newItem, existingItem) => newItem.absolute() === existingItem.absolute(),
    );
  }

  public static pushIfUnique(array: Path[], newItem: Path): void {
    thl_util.pushIfUnique(array, newItem, (newItem, existingItem) => newItem.absolute() === existingItem.absolute());
  }

  public relativeTo(dirname: Pathlike): string {
    const dirpath = Path.ensure(dirname);
    return path.relative(dirpath.absolute(), this._absolute);
  }

  public relativeToCurrent(): string {
    return this.relativeTo(dir.getCurrent());
  }

  public static replaceRelative(text: string, options?: { relativeTo?: Pathlike }): string {
    const match = text.match(Path.ABSOLUTE_PATH_REGEX);

    if (match) {
      let replacementPath: string;
      const beforeText = text.slice(0, match.index);

      if (beforeText.match(Path.HTTP_REGEX) || beforeText.match(Path.PORT_REGEX)) {
        replacementPath = match[0];
      } else {
        const path = new Path(match[0]);
        replacementPath = options?.relativeTo ? path.relativeTo(options.relativeTo) : path.relativeToCurrent();

        if (replacementPath === '') {
          replacementPath = '.';
        } else if (replacementPath.length > path.absolute().length) {
          replacementPath = path.absolute();
        }
      }

      return (
        text.slice(0, match.index) +
        replacementPath +
        Path.replaceRelative(text.slice(match.index! + match[0].length), options)
      );
    } else {
      return text;
    }
  }

  public stat(): fs.Stats | undefined {
    return this.exists() ? fs.statSync(this._absolute) : undefined;
  }

  public toString(): string {
    return this.absolute();
  }

  private resolve(filename: string, relativeTo?: Path): string {
    return path.isAbsolute(filename) ? filename : (relativeTo ?? dir.getCurrent()).joinWith(filename).absolute();
  }
}

export type Pathlike = string | Path;
