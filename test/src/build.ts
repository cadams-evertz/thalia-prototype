import * as thl from 'thalia';

import { buildSrcSubdir } from './subdir/build';

export function buildSrc(): void {
  thl.log.info('--- src START ---');
  buildSrcSubdir();
  thl.log.info('--- src END ---');
}
