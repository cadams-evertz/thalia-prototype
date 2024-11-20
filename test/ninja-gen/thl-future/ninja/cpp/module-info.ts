import * as thl from 'thalia';
import { ModuleInfo as BaseModuleInfo } from '..';

export class ModuleInfo extends BaseModuleInfo {
  constructor(
    id: string,
    dirPath: thl.fs.Pathlike,
    public readonly cflags: string[],
    public readonly lflags: string[],
  ) {
    super(id, dirPath);
  }
}
