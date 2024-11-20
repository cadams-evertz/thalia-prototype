import * as thl from 'thalia';

import { module } from './module';
import { getItem } from '../../util';
import { ModuleInfo } from '../module-info';

export function executable(dirName: thl.fs.Pathlike, config: LibraryConfig): ModuleInfo {
  const id = config.moduleName.replace(/[^A-Za-z0-9]/g, '_');
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

interface LibraryConfig {
  cflags?: string[];
  deps?: ModuleInfo[];
  executableName?: string;
  includes?: string[];
  lflags?: string[];
  moduleName: string;
}
