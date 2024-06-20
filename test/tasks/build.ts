import * as thl from 'thalia';

import * as thlWip from './thl-wip';

import { libb } from './lib/b/build';

thl.util.main(async (args: string[]) => {
  thl.log.info('=== START ===');

  thl.task.BuildDir.set(thl.fs.dir.getCurrent(), 'build-out');

  const echoCommand = args.includes('--echo-commands');
  const clean = args.includes('--clean') || args.includes('--rebuild');
  const build = args.includes('--rebuild') || !args.includes('--clean');

  if (clean) {
    thl.task.BuildDir.clean();
  }

  if (build) {
    const exe = new thlWip.task.cpp.LinkTask({
      sources: ['app/x/src/main.cpp'],
      exe: 'app/x/x',
      echoCommand,
      libs: [libb.get(echoCommand)],
    });
    const exes = new thl.task.GroupTask({
      dependencies: exe.createVariants([
        { variant: { name: 'debug', suffix: '-debug' }, flags: ['-O0', '-g'] },
        { variant: { name: 'release', suffix: '' }, flags: ['-O2'] },
      ]),
    });
    await exes.runAll({ debug: undefined });
  }

  thl.log.info('=== END ===');
});
