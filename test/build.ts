import * as thalia from 'thalia';

import { buildSrc } from './src/build';

console.log('=== START ===');
thalia.submod.foo();
thalia.submod.bar();
buildSrc();

console.log('=== END ===');
