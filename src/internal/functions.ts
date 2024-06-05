export type ArrayOrSingle<T> = T | T[];

export function ensureArray<T>(value: ArrayOrSingle<T>): T[] {
  return Array.isArray(value) ? value : [value];
}
