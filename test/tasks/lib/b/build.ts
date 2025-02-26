import * as thl from 'thalia';

import { liba } from '../a/build';

export const libb = thl.task.cpp.staticLibrary(__dirname, () => ({
  compileFlags: ['-g'],
  defines: ['LIB_B=1'],
  includeDirs: ['include'],
  inputs: thl.fs.file.find('src'),
  lib: 'libb',
  libs: [liba],
}));
