import * as thl_fs from '../fs';
import * as thl_log from '../log';

export class PersistentData {
  private readonly filename: thl_fs.Path;

  constructor(filename: thl_fs.Pathlike) {
    this.filename = thl_fs.Path.ensure(filename);
  }

  public get(): string | undefined {
    return this.filename.exists() ? thl_fs.file.readText(this.filename) : undefined;
  }

  public set(data: string | undefined): void {
    thl_log.setOptionsWhile({ action: false }, () => {
      if (data === undefined) {
        thl_fs.file.remove(this.filename);
      } else {
        thl_fs.file.writeText(this.filename, data);
      }
    });
  }
}
