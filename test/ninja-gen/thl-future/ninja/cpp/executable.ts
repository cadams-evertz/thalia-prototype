import * as thl from 'thalia';

import { getItem } from '../../util';
import { module } from './module';
import { CppModuleInfo } from './cpp-module-info';

export function executable(dirName: thl.fs.Pathlike, config: ExecutableConfig): CppModuleInfo {
  const executableName = config.executableName ?? getItem(config.moduleName.split('/'), -1);

  return module(dirName, {
    cflags: config.cflags,
    deps: config.deps,
    includes: config.includes,
    lflags: config.lflags,
    moduleName: config.moduleName,
    out: executableName,
    rule: 'cpp.link',
  });
}

interface ExecutableConfig {
  cflags?: string[];
  deps?: CppModuleInfo[];
  executableName?: string;
  includes?: string[];
  lflags?: string[];
  moduleName: string;
}
