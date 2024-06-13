import * as thl from 'thalia';

import * as thlWip from './thl-wip';

async function main(): Promise<void> {
  thl.log.info('=== START ===');

  const a = new thlWip.task.cpp.StaticLibTask({
    inputs: ['a.cpp'],
    output: 'liba.a',
    defines: ['NFOO'],
    includeDirs: ['include'],
  });
  const exe = new thlWip.task.cpp.LinkTask({
    inputs: ['b.cpp', a],
    output: 'a.out',
    defines: ['NFOO'],
    includeDirs: ['include'],
  });
  await exe.runAll({ debug: false });

  thl.log.info('=== END ===');
}

main();
