import * as fs from 'fs';

export class TempDir {
  public static readonly dirname = 'jasmine.tmp';

  public static clean(): void {
    if (fs.existsSync(TempDir.dirname)) {
      fs.rmdirSync(TempDir.dirname, { recursive: true });
    }
  }

  public static join(path: string): string {
    return `${TempDir.dirname}/${path}`;
  }
}
