export async function asyncTimeout(ms: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== undefined && value !== null;
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
