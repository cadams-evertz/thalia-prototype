import * as thl_fs from '../../fs';
import * as thl_if from '../../if';
import * as thl_log from '../../log';
import * as thl_process from '../../process';
import * as thl_task from '..';

export function determineDeps(filenames: thl_fs.Path[], compilerFlags: string[]): thl_fs.Path[] {
  const depFilenames: thl_fs.Path[] = [];

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
  public filenames: thl_fs.Path[];

  private readonly depsFilename: thl_fs.Path;

  constructor(private readonly sourceFilename: thl_fs.Path) {
    this.depsFilename = thl_task.BuildDir.asBuildPath(this.sourceFilename.append('.deps'));

    if (this.depsFilename.exists()) {
      const json = thl_fs.file.readJson(this.depsFilename);
      this.command = json.command as string;
      this.filenames = (json.filenames as string[]).map(filename => thl_fs.Path.ensure(filename));
    } else {
      this.command = '';
      this.filenames = [];
    }
  }

  public different(command: string): boolean {
    if (command !== this.command) {
      return true;
    }

    const depsMtime = this.depsFilename.stat()?.mtime;

    if (!depsMtime) {
      return true;
    }

    const sourceMtime = this.sourceFilename.stat()?.mtime;

    if (!sourceMtime) {
      return true;
    }

    if (sourceMtime > depsMtime) {
      return true;
    }

    for (const depFilename of this.filenames) {
      const depMtime = depFilename.stat()?.mtime;

      if (depMtime === undefined || depMtime > depsMtime) {
        return true;
      }
    }

    return false;
  }

  public generate(command: string): void {
    const { output } = thl_process.execute(command, { captureOutput: true, echoCommand: false });

    if (!output) {
      throw new Error(`No output from C++ dependency generation: ${command}`);
    }

    this.command = command;
    this.filenames = output
      .split('\n')
      .filter(line => !!line)
      .filter(line => !line.includes(': '))
      .map(line => (line.endsWith('\\') ? line.slice(0, line.length - 1) : line))
      .map(line => line.trim())
      .map(line => thl_fs.Path.ensure(line))
      .filter(filename => filename.absolute() !== this.sourceFilename.absolute());
  }

  public save(): void {
    thl_log.setOptionsWhile({ action: false }, () => {
      thl_fs.file.writeJson(
        this.depsFilename,
        {
          command: this.command,
          filenames: this.filenames.map(filename => filename.absolute()),
        },
        { if: thl_if.always },
      );
    });
  }
}
