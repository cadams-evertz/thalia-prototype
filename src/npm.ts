import * as thl_fs from './fs';
import * as thl_platform from './platform';
import * as thl_process from './process';

export function npx(
  command: string,
  args: string = '',
  options?: { echoCommand?: boolean; exitOnError?: boolean; useNpx?: boolean },
): number {
  let commandLinePrefix: string;

  if (options?.useNpx) {
    const npx = thl_platform.windows() ? 'npx.cmd' : 'npx';
    commandLinePrefix = `${npx} ${command}`;
  } else {
    const commandPath = findNodeModulesBin(command);

    if (!commandPath) {
      throw new Error(`Could not find node_modules executable ${command}`);
    }

    commandLinePrefix = thl_platform.windows() ? commandPath.absolute() + '.cmd' : commandPath.absolute();
  }

  return thl_process.execute(`${commandLinePrefix} ${args}`, options).exitCode;
}

export function findPackageJson(filename: thl_fs.Pathlike): thl_fs.Path {
  const filePath = thl_fs.Path.ensure(filename);
  const parentPackageJson = filePath.joinWith('package.json');
  return parentPackageJson.exists() ? parentPackageJson : findPackageJson(filePath.dirPath());
}

function findNodeModulesBin(binName: string): thl_fs.Path | undefined {
  const nodeModules = thl_fs.file.findUp(__dirname, 'node_modules');

  if (!nodeModules) {
    return undefined;
  } else {
    const binPath = nodeModules.joinWith('.bin', binName);
    return binPath.exists() ? binPath : undefined;
  }
}
