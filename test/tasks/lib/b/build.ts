import * as thl from 'thalia';

import { liba } from '../a/build';

const options = () => ({
  defines: ['LIB_B=1'],
  includeDirs: ['include'],
  inputs: thl.fs.file.find('src'),
  lib: 'libb',
});

export const libb = {
  debug: thl.task.cpp.staticLibrary(__dirname, [options, thl.task.cpp.variant.debug, { libs: [liba.debug] }]),
  release: thl.task.cpp.staticLibrary(__dirname, [options, thl.task.cpp.variant.release, { libs: [liba.release] }]),
};
