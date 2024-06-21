import * as thl from 'thalia';

import { liba } from '../a/build';

export const libb = new thl.util.Deferred((echoCommand: boolean) => {
  return thl.fs.dir.setCurrentWhile(__dirname, () => {
    return new thl.task.cpp.StaticLibTask({
      sources: thl.fs.file.find('src'),
      lib: 'libb.a',
      includeDirs: ['include'],
      libs: [liba.get(echoCommand)],
      echoCommand,
    });
  });
});
