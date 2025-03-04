import * as thl_future from '../../thl-future';

import { libA } from '../../lib/a/build';
import { libB } from '../../lib/b/build';

export const appX = thl_future.ninja.cpp.executable(__dirname, {
  moduleName: 'app/x',
  deps: [libA, libB],
});
