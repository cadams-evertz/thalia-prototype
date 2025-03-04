import * as thl from 'thalia';

export interface ModuleInfo {
  readonly id: string;
  readonly dirPath: thl.fs.Path;
  readonly outs: thl.fs.Path[];
}
