import * as thl_log from './log';

export async function asyncTimeout(ms: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
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
