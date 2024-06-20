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

thl.util.safeMain(async () => {
  thl.log.info('=== START ===');

  const p = new PrebuildTask();
  // const aa = new thlWip.task.cpp.CompileTask({
  //   source: 'a.cpp',
  //   defines: ['FOO'],
  //   includeDirs: ['include/a'],
  //   echoCommand: true,
  // });
  const a = new thlWip.task.cpp.StaticLibTask({
    sources: ['a.cpp', p],
    lib: 'liba.a',
    defines: ['FOO'],
    includeDirs: ['include/a'],
    echoCommand: true,
  });
  // Prebuilt
  // const a = new thlWip.task.cpp.StaticLibTask({
  //   lib: 'liba.a',
  //   defines: ['FOO'],
  //   includeDirs: ['include/a'],
  // });
  const b = new thlWip.task.cpp.StaticLibTask({
    sources: ['b.cpp'],
    lib: 'libb.a',
    includeDirs: ['include/b'],
    libs: [a],
    echoCommand: true,
  });
  const exe = new thlWip.task.cpp.LinkTask({
    sources: ['main.cpp'],
    exe: 'a.out',
    echoCommand: true,
    libs: [b],
  });
  await exe.runAll({ debug: undefined });

  thl.log.info('=== END ===');
});
