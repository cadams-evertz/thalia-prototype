import * as thl from 'thalia';

import { libb } from '../../lib/b/build';
import { libc } from '../../lib/c/build';

const options = () => ({
  defines: ['APP_X=1'],
  includeDirs: ['include'],
  inputs: thl.fs.file.find('src'),
  exe: 'appx',
  libs: [libc],
});

export const appx = {
  debug: thl.task.cpp.link(__dirname, [options, thl.task.cpp.variant.debug, { libs: [libb.debug] }]),
  release: thl.task.cpp.link(__dirname, [options, thl.task.cpp.variant.release, { libs: [libb.release] }]),
};
