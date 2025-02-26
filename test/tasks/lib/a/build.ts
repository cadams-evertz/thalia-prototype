import * as thl from 'thalia';

export const liba = thl.task.cpp.staticLibrary(__dirname, () => ({
  compileFlags: ['-g'],
  defines: ['LIB_A=1'],
  includeDirs: ['include'],
  inputs: thl.fs.file.find('src'),
  lib: 'liba',
}));
