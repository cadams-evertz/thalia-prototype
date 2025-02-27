import * as thl from 'thalia';

export const libc = thl.task.cpp.staticLibrary(__dirname, () => ({
  compileFlags: ['-g'],
  defines: ['LIB_C=1'],
  includeDirs: ['include'],
  lib: 'liblibc.a',
  prebuilt: true,
}));
