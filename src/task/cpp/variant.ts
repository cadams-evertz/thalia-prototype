import * as thl_util from '../../util';

import { CppTask } from './cpp-task';

export class Variant {
  constructor(private readonly options: Partial<CppTask.Options>) {}

  public merge<T extends CppTask.Options>(
    options: thl_util.Resolvable<T>,
    ...mixins: thl_util.Resolvable<Partial<T>>[]
  ): T {
    return thl_util.merge<T>(
      thl_util.Resolvable.resolve(options),
      this.options as Partial<T>,
      ...mixins.map(mixin => thl_util.Resolvable.resolve(mixin)),
    );
  }
}

export const variant = {
  debug: new Variant({
    compileFlags: ['-g', '-O0'],
    variantSuffix: '-debug',
  }),
  release: new Variant({
    compileFlags: ['-O2'],
  }),
};
