import * as thl from 'thalia';

export function determineDeps(filenames: thl.fs.Path[], compilerFlags: string[]): thl.fs.Path[] | undefined {
  const depFilenames: thl.fs.Path[] = [];

  for (const filename of filenames) {
    if (!filename.endsWith('.cpp') || !filename.exists()) {
      continue;
    }

    const depsData = new DepsData(filename);
    const command = `g++ -MM ${compilerFlags.join(' ')} ${filename.absolute()}`;

    if (depsData.different(command)) {
      depsData.generate(command);
      depsData.save();
    }

    depFilenames.push(...depsData.filenames);
  }

  return depFilenames;
}

class DepsData {
  private command: string;
  public filenames: thl.fs.Path[];

  private readonly depsFilename: thl.fs.Path;

  constructor(private readonly sourceFilename: thl.fs.Path) {
    this.depsFilename = thl.task.BuildDir.asBuildPath(this.sourceFilename.append('.deps'));

    if (this.depsFilename.exists()) {
      const json = thl.fs.file.readJson(this.depsFilename);
      this.command = json.command;
      this.filenames = json.filenames.map(filename => thl.fs.Path.ensure(filename));
    } else {
      this.command = '';
      this.filenames = [];
    }
  }

  public different(command: string): boolean {
    if (command !== this.command) {
      return true;
    }

    const depsMtime = this.depsFilename.stat().mtime;

    if (this.sourceFilename.stat().mtime > depsMtime) {
      return true;
    }

    for (const depFilename of this.filenames) {
      if (depFilename.stat().mtime > depsMtime) {
        return true;
      }
    }

    return false;
  }

  public generate(command: string): void {
    const { output } = thl.process.execute(command, { captureOutput: true, echoCommand: false });

    this.command = command;
    this.filenames = output
      .split('\n')
      .filter(line => !!line)
      .filter(line => !line.includes(': '))
      .map(line => (line.endsWith('\\') ? line.slice(0, line.length - 1) : line))
      .map(line => line.trim())
      .map(line => thl.fs.Path.ensure(line))
      .filter(filename => filename.absolute() !== this.sourceFilename.absolute());
  }

  public save(): void {
    thl.log.setOptionsWhile({ action: false }, () => {
      thl.fs.file.writeJson(
        this.depsFilename,
        {
          command: this.command,
          filenames: this.filenames.map(filename => filename.absolute()),
        },
        { if: thl.if.always },
      );
    });
  }
}
