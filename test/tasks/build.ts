import * as thl from 'thalia';

// import * as thlWip from './thl-wip';

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
    const zip = new thl.task.pkg.ZipTask({
      inputs: appx.get(echoCommand).dependencies,
      output: 'test.zip',
      rootDir: thl.task.BuildDir.buildDir,
    });

    await zip.runAll();
  }

  thl.log.info('=== END ===');
});
