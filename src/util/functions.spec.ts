import 'jasmine';

import { combineArrays, ensureArray, isDefined, pushAllIfUnique, pushIfUnique } from './functions';

it('combineArrays', () => {
  expect(combineArrays([])).toEqual([]);
  expect(combineArrays([undefined])).toEqual([]);
  expect(
    combineArrays([
      [1, 2],
      [3, 4],
    ]),
  ).toEqual([1, 2, 3, 4]);
  expect(combineArrays([undefined, [1, 2], undefined, [3, 4], null])).toEqual([1, 2, 3, 4]);
  expect(
    combineArrays([
      [1, 2, 3],
      [3, 4],
    ]),
  ).toEqual([1, 2, 3, 3, 4]);
  expect(
    combineArrays(
      [
        [1, 2, 3],
        [3, 4],
      ],
      { unique: true },
    ),
  ).toEqual([1, 2, 3, 4]);
});

it('ensureArray', () => {
  expect(ensureArray(undefined)).toEqual([]);
  expect(ensureArray(null)).toEqual([]);
  expect(ensureArray([])).toEqual([]);
  expect(ensureArray(1)).toEqual([1]);
  expect(ensureArray([1])).toEqual([1]);
  expect(ensureArray([1, 2, 3])).toEqual([1, 2, 3]);
});

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
