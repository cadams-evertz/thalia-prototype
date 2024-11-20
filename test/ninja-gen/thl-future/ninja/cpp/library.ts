import * as thl from 'thalia';

import { getItem } from '../../util';
import { module } from './module';
import { ModuleInfo } from './module-info';

export function library(dirName: thl.fs.Pathlike, config: LibraryConfig): ModuleInfo {
  const id = config.moduleName.replace(/[^A-Za-z0-9]/g, '_');
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

interface LibraryConfig {
  cflags?: string[];
  deps?: ModuleInfo[];
  includes?: string[];
  lflags?: string[];
  libName?: string;
  moduleName: string;
}
