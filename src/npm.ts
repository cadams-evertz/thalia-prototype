import * as thalia_fs from './fs';
import * as thalia_platform from './platform';
import * as thalia_process from './process';

export function npx(
  command: string,
  args: string = '',
  options?: { echoCommand?: boolean; exitOnError?: boolean; useNpx?: boolean },
): number {
  let commandLinePrefix: string;

  if (options?.useNpx) {
    const npx = thalia_platform.windows() ? 'npx.cmd' : 'npx';
    commandLinePrefix = `${npx} ${command}`;
  } else {
    const commandPath = findNodeModulesBin(command);

    if (!commandPath) {
      throw new Error(`Could not find node_modules executable ${command}`);
    }

    commandLinePrefix = thalia_platform.windows() ? commandPath.absolute() + '.cmd' : commandPath.absolute();
  }

  return thalia_process.execute(`${commandLinePrefix} ${args}`, options).exitCode;
}

export function findPackageJson(filename: thalia_fs.Pathlike): thalia_fs.Path {
  const filePath = thalia_fs.Path.ensure(filename);
  const parentPackageJson = filePath.joinWith('package.json');
  return parentPackageJson.exists() ? parentPackageJson : findPackageJson(filePath.dirPath());
}

function findNodeModulesBin(binName: string): thalia_fs.Path | undefined {
  const nodeModules = thalia_fs.file.findUp(__dirname, 'node_modules');

  if (!nodeModules) {
    return undefined;
  } else {
    const binPath = nodeModules.joinWith('.bin', binName);
    return binPath.exists() ? binPath : undefined;
  }
}
