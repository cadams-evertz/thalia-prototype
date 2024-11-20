import * as thl from 'thalia';

export class File {
  protected readonly filePath: thl.fs.Path;

  private readonly codeLines: string[] = [];
  private lastLineType: LineType = undefined;

  constructor(filename: thl.fs.Pathlike) {
    this.filePath = thl.fs.Path.ensure(filename);

    this.define('ninjaFileDir', this.filePath.dirPath());
    this.lastLineType = 'always';
  }

  public build(rule: string, in_: string[], out: string[], params?: Record<string, string>): void {
    this.addGap('build');

    this.codeLines.push(`build ${out.join(' ')}: ${rule} ${in_.join(' ')}`);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        this.codeLines.push(`  ${key} = ${value}`);
      }
    }
  }

  public define(name: string, value: unknown): void {
    this.addGap('define');
    this.codeLines.push(`${name} = ${value}`);
  }

  public include(filenames: thl.util.ArrayOrSingle<thl.fs.Pathlike> | undefined): void {
    if (!filenames) {
      return;
    }

    filenames = thl.util.ensureArray(filenames);

    if (filenames.length === 0) {
      return;
    }

    this.addGap('include');

    for (const filename of filenames) {
      this.codeLines.push(`include ${filename}`);
    }
  }

  private addGap(lineType: LineType): void {
    if (this.lastLineType && (lineType === 'build' || this.lastLineType !== lineType)) {
      this.codeLines.push('');
    }
    this.lastLineType = lineType;
  }

  public write(): void {
    thl.fs.file.writeText(this.filePath, this.codeLines.join('\n') + '\n');
  }
}

type LineType = 'always' | 'build' | 'define' | 'include' | undefined;
