import * as thl_util from '../../util';

import { CppTask } from './cpp-task';
import { PassedOptions } from './passed-options';

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

export class Variants<TVariantName extends string> {
  constructor(public readonly options: Record<TVariantName, Variant>) {}

  public create<TTask, TOptions extends CppTask.Options>(
    taskCreator: (options: PassedOptions<TOptions>) => TTask,
    options: thl_util.Resolvable<TOptions>,
    variantOptions?: Record<TVariantName, thl_util.Resolvable<Partial<TOptions>>>,
  ): Record<TVariantName, TTask> {
    return Object.fromEntries(
      (Object.entries(this.options) as Array<[TVariantName, Variant]>).map(([variantName, variant]) => [
        variantName,
        taskCreator({
          common: options,
          variant,
          additional: [((variantOptions as any)?.[variantName] ?? {}) as thl_util.Resolvable<Partial<TOptions>>],
        }),
      ]),
    ) as Record<TVariantName, TTask>;
  }
}

export const variants = new Variants({
  debug: new Variant({
    compileFlags: ['-g', '-O0'],
    variantSuffix: '-debug',
  }),
  release: new Variant({
    compileFlags: ['-O2'],
  }),
});
