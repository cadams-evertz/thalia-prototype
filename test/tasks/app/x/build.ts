import * as thl from 'thalia';

import { libb } from '../../lib/b/build';
import { libc } from '../../lib/c/build';

export const appx = thl.task.cpp.variants.create(
  thl.task.cpp.link,
  () => ({
    defines: ['APP_X=1'],
    includeDirs: ['include'],
    inputs: thl.fs.file.find('src'),
    exe: 'appx',
    libs: [libc],
  }),
  { debug: { libs: [libb.debug] }, release: { libs: [libb.release] } },
);
