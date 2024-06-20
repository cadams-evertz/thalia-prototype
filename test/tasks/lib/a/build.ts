import * as thl from 'thalia';

import * as thlWip from '../../thl-wip';

export const liba = new thl.util.Deferred((echoCommand: boolean) => {
  return thl.fs.dir.setCurrentWhile(__dirname, () => {
    const p = new PrebuildTask();
    return new thlWip.task.cpp.StaticLibTask({
      sources: ['src/a.cpp', p],
      lib: 'liba.a',
      defines: ['FOO'],
      includeDirs: ['include'],
      echoCommand,
    });
  });
});

class PrebuildTask extends thl.task.FileProviderTask {
  private readonly output: thl.fs.Path;

  constructor() {
    const output = thl.task.BuildDir.asBuildPath('src/generated.cpp');
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
