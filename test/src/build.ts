import * as thalia from 'thalia';

import { buildSrcSubdir } from './subdir/build';

export function buildSrc(): void {
  console.log('--- src START ---');
  thalia.submod.foo();
  buildSrcSubdir();
  console.log('--- src END ---');
}
