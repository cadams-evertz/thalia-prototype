import * as thl from 'thalia';

import * as thlWip from '../../thl-wip';

import { liba } from '../a/build';

export const libb = new thl.util.Deferred((echoCommand: boolean) => {
  return thl.fs.dir.setCurrentWhile(__dirname, () => {
    return new thlWip.task.cpp.StaticLibTask({
      sources: ['src/b.cpp'],
      lib: 'libb.a',
      includeDirs: ['include'],
      libs: [liba.get(echoCommand)],
      echoCommand,
    });
  });
});
