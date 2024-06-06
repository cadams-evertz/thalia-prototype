import 'jasmine';

import * as thl_if from '../if';
import { create } from './dir';
import { TempDir } from './temp-dir.spec';

describe('create', () => {
  beforeEach(TempDir.clean);
  afterEach(TempDir.clean);

  it('works', () => {
    expect(create(TempDir.join('foo'))).toBeTrue();
    expect(create(TempDir.join('foo'))).toBeFalse();
    expect(create(TempDir.join('foo'), { if: thl_if.always })).toBeTrue();
    expect(create(TempDir.join('foo'), { dryRun: true })).toBeFalse();

    expect(create(TempDir.join('bar'), { dryRun: true })).toBeTrue();
    expect(create(TempDir.join('bar'), { dryRun: true })).toBeTrue();
  });
});
