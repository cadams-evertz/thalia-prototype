import * as thl from 'thalia';

import { liba } from '../a/build';

export const libb = thl.task.cpp.variants.create(
  thl.task.cpp.staticLibrary,
  () => ({
    defines: ['LIB_B=1'],
    includeDirs: ['include'],
    inputs: thl.fs.file.find('src'),
    lib: 'libb',
  }),
  { debug: { libs: [liba.debug] }, release: { libs: [liba.release] } },
);
