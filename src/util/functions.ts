import * as thl_fs from '../fs';
import * as thl_log from '../log';

import { ArrayOrSingle } from './types';

export async function asyncTimeout(ms: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

export function combineArrays<T>(arrays: Array<T[] | null | undefined>, options?: { unique?: boolean }): T[] {
  let result = arrays.reduce((prev: T[], arr) => (arr ? prev.concat(arr) : prev), []);

  if (options?.unique) {
    result = unique(result);
  }

  return result;
}

export function determineUserCodePath(): thl_fs.Path {
  const stack = new Error().stack;
  const userCodePath = stack
    ?.split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('at '))
    .filter(line => !line.includes('/node_modules/'))
    .map(line => line.match(/\((.*):\d+:\d+\)/)?.[1])
    .filter(line => line)[0];

  if (!userCodePath) {
    throw new Error('Could not determine user code path in:\n' + stack);
  }

  return thl_fs.Path.ensure(userCodePath);
}

export function ensureArray<T>(value: ArrayOrSingle<T> | null | undefined): T[] {
  return !value ? [] : Array.isArray(value) ? value : [value];
}

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== undefined && value !== null;
}

export async function main(
  innerMain: (args: string[]) => void | Promise<void>,
  options?: { rethrow?: boolean },
): Promise<void> {
  try {
    await innerMain(process.argv.slice(2));
  } catch (error) {
    thl_log.error(`${error}`);

    if (options?.rethrow) {
      throw error;
    }
  }
}

export function merge<T>(mergeTo: T, ...mixins: Partial<T>[]): T {
  for (const mixin of mixins) {
    if (Array.isArray(mergeTo)) {
      mergeTo = [...mergeTo, ...(mixin as unknown as unknown[])] as T;
    } else if (typeof mergeTo === 'object') {
      mergeTo = {
        ...mergeTo,
        ...Object.fromEntries(
          Object.entries(mixin).map(([key, value]) => [key, merge((mergeTo as any)[key], value as Partial<T>)]),
        ),
      };
    } else {
      mergeTo = mixin as T;
    }
  }

  return mergeTo;
}

export function pushAllIfUnique<T>(array: T[], newItems: T[], equals?: (newItem: T, existingItem: T) => boolean): void {
  for (const newItem of newItems) {
    pushIfUnique(array, newItem, equals);
  }
}

export function pushIfUnique<T>(array: T[], newItem: T, equals?: (newItem: T, existingItem: T) => boolean): void {
  if (equals) {
    for (const existingItem of array) {
      if (equals(newItem, existingItem)) {
        return;
      }
    }
  } else if (array.includes(newItem)) {
    return;
  }

  array.push(newItem);
}

export function unique<T>(items: T[]): T[] {
  return items.reduce((prev, item) => (prev.includes(item) ? prev : [...prev, item]), [] as T[]);
}

export function* walkObject(
  obj: Record<string, any> | any[] | null | undefined,
  parentPath: string[] = [],
): Generator<walkObject.Entry> {
  if (obj) {
    for (const key of Object.keys(obj)) {
      const path = [...parentPath, key];
      // @ts-ignore - Doesn't like `any[]` here
      const value = obj[key];

      yield new walkObject.Entry(obj, key, path);

      if (typeof value === 'object' || Array.isArray(value)) {
        yield* walkObject(value, path);
      }
    }
  }
}

export namespace walkObject {
  export class Entry {
    public get value(): any {
      return this.parentObject[this.key];
    }
    public set value(value: any) {
      this.parentObject[this.key] = value;
    }

    constructor(
      private readonly parentObject: Record<string, any>,
      public readonly key: string,
      public readonly path: string[],
    ) {}

    public delete(): void {
      delete this.parentObject[this.key];
    }

    public toString(): string {
      return `${this.path.join('/')}=${JSON.stringify(this.value)}`;
    }
  }
}
