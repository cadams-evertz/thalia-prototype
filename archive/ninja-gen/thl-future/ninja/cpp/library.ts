import * as thl from 'thalia';

import { getItem } from '../../util';
import { module, module2 } from './module';
import { CppModuleInfo } from './cpp-module-info';
import { sanitiseId, File } from '..';

export function library(dirName: thl.fs.Pathlike, config: LibraryConfig): CppModuleInfo {
  const id = sanitiseId(config.moduleName);
  const libName = config.libName ?? getItem(config.moduleName.split('/'), -1);

  return module(dirName, {
    cflags: config.cflags,
    deps: config.deps,
    includes: config.includes,
    lflags: [...(config.lflags ?? []), `-L\${${id}.dir}/build-out`, `-l${libName}`],
    moduleName: config.moduleName,
    out: `lib${libName}.a`,
    rule: 'cpp.lib',
  });
}

export function library2(ninjaFile: File, dirName: thl.fs.Pathlike, config: LibraryConfig): CppModuleInfo {
  const id = sanitiseId(config.moduleName);
  const libName = config.libName ?? getItem(config.moduleName.split('/'), -1);

  return module2(ninjaFile, dirName, {
    cflags: config.cflags,
    deps: config.deps,
    includes: config.includes,
    lflags: [...(config.lflags ?? []), `-L\${${id}.dir}/build-out`, `-l${libName}`],
    moduleName: config.moduleName,
    out: `lib${libName}.a`,
    rule: 'cpp.lib',
  });
}

interface LibraryConfig {
  cflags?: string[];
  deps?: CppModuleInfo[];
  includes?: string[];
  lflags?: string[];
  libName?: string;
  moduleName: string;
}
