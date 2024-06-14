import * as thl from 'thalia';

import * as thlWip from './thl-wip';

async function main(): Promise<void> {
  thl.log.info('=== START ===');

  // const a_o = new thlWip.task.cpp.CompileTask({
  //   source: 'a.cpp',
  //   includeDirs: ['include'],
  // });
  // await a_o.runAll();
  const a = new thlWip.task.cpp.StaticLibTask({
    sources: ['a.cpp'],
    lib: 'liba.a',
    defines: ['NFOO'],
    includeDirs: ['include'],
  });
  // await a.runAll();
  const exe = new thlWip.task.cpp.LinkTask({
    sources: ['b.cpp'],
    exe: 'a.out',
    defines: ['NFOO'],
    includeDirs: ['include'],
    libs: [a],
  });
  await exe.runAll({ debug: undefined });

  thl.log.info('=== END ===');
}

main();
