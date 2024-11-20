import * as thl from 'thalia';

export function build(dirName: thl.fs.Pathlike, commandLine: string = ''): void {
  thl.fs.dir.setCurrentWhile(dirName, () => {
    thl.process.execute(`ninja ${commandLine}`);
  });
}

export function clean(dirName: thl.fs.Pathlike): void {
  build(dirName, '-t clean');
}
