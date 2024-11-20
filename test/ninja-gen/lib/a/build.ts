import * as thl_future from '../../thl-future';
import { libB } from '../b/build';

export const libA = thl_future.ninja.cpp.library(__dirname, {
  moduleName: 'lib/a',
  cflags: ['-DLIBA'],
  deps: [libB],
});
