import * as thl_future from '../../thl-future';
import { libB2 } from '../b/build';

// export const libA = thl_future.ninja.cpp.library(__dirname, {
//   moduleName: 'lib/a',
//   cflags: ['-DLIBA'],
//   deps: [libB],
// });

export function libA2(ninjaFile: thl_future.ninja.File): thl_future.ninja.ModuleInfo {
  return thl_future.ninja.cpp.library2(ninjaFile, __dirname, {
    moduleName: 'lib/a',
    cflags: ['-DLIBA'],
    // deps: [libB2],
  });
}
