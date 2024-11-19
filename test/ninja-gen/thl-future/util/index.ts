export function getItem<T>(array: T[] | null | undefined, index: number): T | undefined {
  if (!array) {
    return undefined;
  } else if (index >= 0) {
    return array[index];
  } else {
    return array[array.length + index];
  }
}
