import * as thalia from 'thalia';

import { buildSrcSubdir } from './subdir/build';

export function buildSrc(): void {
  thalia.log.info('--- src START ---');
  buildSrcSubdir();
  thalia.log.info('--- src END ---');
}
