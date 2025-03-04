import * as thl from 'thalia';

const generatedCode = thl.task.code({
  description: 'Generating code...',
  output: 'src/generated.cpp',
  needToRun: () => true,
  run: outputs => {
    const code = 'int generated() { return 1000; }\n';
    thl.fs.file.writeText(outputs[0], code, { if: thl.if.differentContents });
  },
});

export const liba = thl.task.cpp.variants.create(thl.task.cpp.staticLibrary, () => ({
  defines: ['LIB_A=1'],
  includeDirs: ['include'],
  inputs: [...thl.fs.file.find('src'), generatedCode],
  lib: 'liba',
}));
