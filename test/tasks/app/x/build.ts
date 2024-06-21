import * as thl from 'thalia';

import { libb } from '../../lib/b/build';

export const appx = new thl.util.Deferred((echoCommand: boolean) => {
  return thl.fs.dir.setCurrentWhile(__dirname, () => {
    const exe = new thl.task.cpp.LinkTask({
      sources: thl.fs.file.find('src'),
      exe: 'x',
      echoCommand,
      libs: [libb.get(echoCommand)],
    });

    return new thl.task.GroupTask<thl.task.FileProviderTask>({
      dependencies: exe.createVariants([
        { variant: { name: 'debug', suffix: '-debug' }, flags: ['-O0', '-g'] },
        { variant: { name: 'release', suffix: '' }, flags: ['-O2'] },
      ]),
    });
  });
});
