import * as thl_future from '../../thl-future';

export const libB = thl_future.ninja.cpp.library(__dirname, {
  moduleName: 'lib/b',
  cflags: ['-DLIBB'],
});
