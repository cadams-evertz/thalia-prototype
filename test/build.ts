import * as thalia from 'thalia';

import { buildSrc } from './src/build';

console.log('=== START ===');
thalia.submod.foo();
buildSrc();

console.log('=== END ===');
