import 'jasmine';

import { isDefined } from './util';

it('isDefined', () => {
  expect(isDefined(undefined)).toBeFalse();
  expect(isDefined(null)).toBeFalse();
  expect(isDefined('')).toBeTrue();
  expect(isDefined({})).toBeTrue();
  expect(isDefined([])).toBeTrue();
  expect(isDefined(false)).toBeTrue();
  expect(isDefined(0)).toBeTrue();
  expect(isDefined('abc')).toBeTrue();
  expect(isDefined({ a: 1 })).toBeTrue();
  expect(isDefined([1])).toBeTrue();
  expect(isDefined(true)).toBeTrue();
  expect(isDefined(101)).toBeTrue();
});
