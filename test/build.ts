import * as thalia from 'thalia';

import { buildSrc } from './src/build';

thalia.log.info('=== START ===');
buildSrc();

thalia.log.info('=== END ===');
