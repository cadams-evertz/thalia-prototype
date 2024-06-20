import * as thl from 'thalia';

import * as thlWip from './thl-wip';

class PrebuildTask extends thl.task.FileProviderTask {
  private readonly output: thl.fs.Path;

  constructor() {
    const output = thl.task.BuildDir.asBuildPath('lib/a/src/generated.cpp');
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

thl.util.main(async (args: string[]) => {
  thl.log.info('=== START ===');

  const echoCommand = args.includes('--echo-commands');

  thl.task.BuildDir.set(thl.fs.dir.getCurrent(), 'build-out');

  const clean = args.includes('--clean') || args.includes('--rebuild');
  const build = args.includes('--rebuild') || !args.includes('--clean');

  if (clean) {
    thl.task.BuildDir.clean();
  }

  if (build) {
    const p = new PrebuildTask();
    // const aa = new thlWip.task.cpp.CompileTask({
    //   source: 'lib/a/src/a.cpp',
    //   defines: ['FOO'],
    //   includeDirs: ['lib/a/include'],
    //   echoCommand,
    // });
    const a = new thlWip.task.cpp.StaticLibTask({
      sources: ['lib/a/src/a.cpp', p],
      lib: 'lib/a/liba.a',
      defines: ['FOO'],
      includeDirs: ['lib/a/include'],
      echoCommand,
    });
    // Prebuilt
    // const a = new thlWip.task.cpp.StaticLibTask({
    //   lib: 'liba.a',
    //   defines: ['FOO'],
    //   includeDirs: ['include/a'],
    // });
    const b = new thlWip.task.cpp.StaticLibTask({
      sources: ['lib/b/src/b.cpp'],
      lib: 'lib/b/libb.a',
      includeDirs: ['lib/b/include'],
      libs: [a],
      echoCommand,
    });
    const exe = new thlWip.task.cpp.LinkTask({
      sources: ['app/x/src/main.cpp'],
      exe: 'app/x/x',
      echoCommand,
      libs: [b],
    });
    const exes = new thl.task.GroupTask({
      dependencies: [
        exe.createVariant({ variant: { name: 'debug', suffix: '-debug' }, flags: ['-O0', '-g'] }),
        exe.createVariant({ variant: { name: 'release', suffix: '' }, flags: ['-O2'] }),
      ],
    });
    await exes.runAll({ debug: undefined });
  }

  thl.log.info('=== END ===');
});
