import * as thl from 'thalia';
import * as thl_future from './thl-future';

// import { appX } from './app/x/build';
// import { libA2 } from './lib/a/build';
// import { libB2 } from './lib/b/build';

const n3 = thl_future.build.test.testCat({
  id: 'n/3',
  dirPath: '.',
  in: ['c'],
  out: 'n3',
});

const n2 = thl_future.build.test.testCat({
  id: 'n/2',
  dirPath: '.',
  deps: [n3],
  in: ['b'],
  out: 'n2',
});

const n1 = thl_future.build.test.testCat({
  id: 'n/1',
  dirPath: '.',
  deps: [n2, n3],
  out: 'n1',
});

// thl_future.build.writeNinjaFile([n1, n2, n3]);
thl_future.build.writeNinjaFile([n1]);

if (process.argv.includes('clean') || process.argv.includes('rebuild')) {
  thl_future.ninja.clean('.');
}

if (!process.argv.includes('clean')) {
  thl_future.ninja.build('.');
}
