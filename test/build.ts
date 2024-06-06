import * as thl from 'thalia';

import { buildSrc } from './src/build';

thl.log.info('=== START ===');
buildSrc();

thl.log.info('=== END ===');
