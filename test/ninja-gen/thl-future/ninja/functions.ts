import * as thl from 'thalia';

export function build(dirName: thl.fs.Pathlike, commandLine: string = ''): void {
  const dirPath = thl.fs.Path.ensure(dirName);
  thl.process.execute(`ninja -C ${dirPath} ${commandLine}`);
}

export function clean(dirName: thl.fs.Pathlike): void {
  build(dirName, '-t clean');
}

export function sanitiseId(id: string): string {
  return id.replace(/[^A-Za-z0-9]/g, '_');
}
