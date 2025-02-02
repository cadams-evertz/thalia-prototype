import * as thl_future from '../../thl-future';

// export const libB = thl_future.ninja.cpp.library(__dirname, {
//   moduleName: 'lib/b',
//   cflags: ['-DLIBB'],
// });

export function libB2(ninjaFile: thl_future.ninja.File): thl_future.ninja.ModuleInfo {
  return thl_future.ninja.cpp.library2(ninjaFile, __dirname, {
    moduleName: 'lib/b',
    cflags: ['-DLIBB'],
  });
}
