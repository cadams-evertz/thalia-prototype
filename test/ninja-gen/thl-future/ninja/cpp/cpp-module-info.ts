import { ModuleInfo } from '..';

export interface CppModuleInfo extends ModuleInfo {
  readonly cflags: string[];
  readonly lflags: string[];
}
