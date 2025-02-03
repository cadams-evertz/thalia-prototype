import * as thl_fs from '../fs';

export class BuildDir {
  public static buildDir: thl_fs.Path;

  private static projectRoot: thl_fs.Path;

  public static set(projectRoot: thl_fs.Pathlike, buildSubDir: string): void {
    BuildDir.projectRoot = thl_fs.Path.ensure(projectRoot);
    BuildDir.buildDir = BuildDir.projectRoot.append(`/${buildSubDir}`);
  }

  public static asBuildPath(path: thl_fs.Pathlike): thl_fs.Path {
    if (!BuildDir.buildDir) {
      throw new Error('Build dir not set');
    }

    path = thl_fs.Path.ensure(path);

    const pathAbs = path.absolute();
    const projectRootAbs = BuildDir.projectRoot.absolute();

    if (!pathAbs.startsWith(projectRootAbs)) {
      throw new Error(`Path ${path} is not a child of project root ${BuildDir.projectRoot}`);
    }

    return pathAbs.startsWith(this.buildDir.absolute())
      ? path
      : BuildDir.buildDir.append(pathAbs.slice(projectRootAbs.length));
  }

  public static asBuildPathArray(paths: thl_fs.Pathlike[]): thl_fs.Path[] {
    return paths.map(path => BuildDir.asBuildPath(path));
  }

  public static clean(): void {
    thl_fs.dir.remove(BuildDir.buildDir);
  }
}
