import * as thl from 'thalia';
import { build, clean } from './functions';

export class ModuleInfo {
  public readonly dirPath: thl.fs.Path;

  constructor(public readonly id: string, dirPath: thl.fs.Pathlike) {
    this.dirPath = thl.fs.Path.ensure(dirPath);
  }

  public build(): void {
    build(this.dirPath);
  }

  public clean(): void {
    clean(this.dirPath);
  }
}
