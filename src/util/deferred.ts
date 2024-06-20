export class Deferred<TValue, TCreatorArg = void> {
  private value?: TValue;

  constructor(private readonly valueCreator: (arg: TCreatorArg) => TValue) {}

  public get(arg: TCreatorArg): TValue {
    if (this.value === undefined) {
      this.value = this.valueCreator(arg);
    }

    return this.value;
  }
}
