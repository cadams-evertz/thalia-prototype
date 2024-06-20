import * as thl from 'thalia';

import * as thlWip from './thl-wip';

class PrebuildTask extends thl.task.FileProviderTask {
  private readonly output: thl.fs.Path;

  constructor() {
    const output = thl.fs.Path.ensure('generated.cpp');
    super({
      description: `Generating ${output}...`,
      files: [output],
    });
    this.output = output;
  }

  public override async run(): Promise<void> {
    this.logDescription();
    thl.fs.file.writeText(this.output, 'int generated() { return 123; }\n', { if: thl.if.differentContents });
  }
}

async function main(): Promise<void> {
  thl.log.info('=== START ===');

  const p = new PrebuildTask();
  const a = new thlWip.task.cpp.StaticLibTask({
    sources: ['a.cpp', p],
    lib: 'liba.a',
    defines: ['NFOO'],
    includeDirs: ['include'],
  });
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
