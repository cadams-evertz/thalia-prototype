import * as thl from 'thalia';
import { build, clean } from './functions';

export class ModuleInfo {
  public readonly dirPath: thl.fs.Path;

  constructor(
    public readonly id: string,
    dirPath: thl.fs.Pathlike,
    public readonly cflags: string[],
    public readonly lflags: string[],
  ) {
    this.dirPath = thl.fs.Path.ensure(dirPath);
  }

  public build(): void {
    build(this.dirPath);
  }

  public clean(): void {
    clean(this.dirPath);
  }
}
