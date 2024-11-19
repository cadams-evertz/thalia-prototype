import { appX } from './app/x/build';

if (process.argv.includes('clean') || process.argv.includes('rebuild')) {
  appX.clean();
}

if (!process.argv.includes('clean')) {
  appX.build();
}
