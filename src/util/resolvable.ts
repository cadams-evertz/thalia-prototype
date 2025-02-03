export type Resolvable<T> = T | (() => T);

export namespace Resolvable {
  export function resolve<T>(resolvable: Resolvable<T>): T {
    return resolvable instanceof Function ? resolvable() : resolvable;
  }
}
