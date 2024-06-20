import 'jasmine';

import { isDefined, pushAllIfUnique, pushIfUnique } from './functions';

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

it('pushAllIfUnique', () => {
  function test<T>(
    inputArr: T[],
    items: T[],
    equals: ((newItem: T, existingItem: T) => boolean) | undefined,
  ): jasmine.ArrayLikeMatchers<T> {
    const arr = [...inputArr];
    pushAllIfUnique(arr, items, equals);
    return expect(arr);
  }

  test([], ['a', 'b'], undefined).toEqual(['a', 'b']);
  test(['a'], ['z', 'a'], undefined).toEqual(['a', 'z']);
  test(['a'], ['b', 'z', 'b'], undefined).toEqual(['a', 'b', 'z']);
  test(['b'], ['z', 'a'], undefined).toEqual(['b', 'z', 'a']);
  test(['b'], ['z', 'B', 'a'], (newItem, existingItem) => newItem.toLowerCase() === existingItem.toLowerCase()).toEqual(
    ['b', 'z', 'a'],
  );
});

it('pushIfUnique', () => {
  function test<T>(
    inputArr: T[],
    item: T,
    equals: ((newItem: T, existingItem: T) => boolean) | undefined,
  ): jasmine.ArrayLikeMatchers<T> {
    const arr = [...inputArr];
    pushIfUnique(arr, item, equals);
    return expect(arr);
  }

  test([], 'a', undefined).toEqual(['a']);
  test(['a'], 'a', undefined).toEqual(['a']);
  test(['b'], 'a', undefined).toEqual(['b', 'a']);
  test(['b'], 'B', (newItem, existingItem) => newItem.toLowerCase() === existingItem.toLowerCase()).toEqual(['b']);
});
