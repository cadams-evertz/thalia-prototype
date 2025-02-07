import * as thl from 'thalia';

// import { libb } from '../../lib/b/build';

export const appx = thl.task.cpp.link(__dirname, () => ({
  compileFlags: ['-g'],
  defines: ['FOO=1'],
  includeDirs: ['include'],
  inputs: thl.fs.file.find('src'),
  exe: 'appx',
}));
