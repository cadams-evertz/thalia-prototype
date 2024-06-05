import * as thalia from 'thalia';

export function buildSrcSubdir(): void {
  console.log('--- src/subdir START ---');
  thalia.submod.foo();
  console.log('--- src/subdir END ---');
}
