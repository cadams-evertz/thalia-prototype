export type Resolvable<T> = T | (() => T);

export namespace Resolvable {
  export function resolve<T>(resolvable: Resolvable<T>): T {
    return resolvable instanceof Function ? resolvable() : resolvable;
  }
}

export class ResolvableCache<T> {
  private data?: T;

  constructor(private readonly valueCreator: () => T) {}

  get value(): T {
    if (this.data === undefined) {
      this.data = this.valueCreator();
    }

    return this.data;
  }

  public get resolvable(): Resolvable<T> {
    return () => this.value;
  }
}
