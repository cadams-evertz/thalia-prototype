import * as thl from 'thalia';

import { appx } from './app/x/build';

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
    await appx.get(echoCommand).runAll({ debug: undefined });
  }

  thl.log.info('=== END ===');
});
