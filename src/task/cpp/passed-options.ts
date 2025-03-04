import * as thl_util from '../../util';

import { CppTask } from './cpp-task';
import { Variant } from './variants';

type VariantOptions<T> = {
  common: thl_util.Resolvable<T>;
  variant: Variant;
  additional: thl_util.Resolvable<Partial<T>>[];
};

namespace VariantOptions {
  export function is<T>(value: unknown): value is VariantOptions<T> {
    return typeof value === 'object' && Object.keys(value as any).join(',') === 'common,variant,additional';
  }
}

export type PassedOptions<T extends CppTask.Options> = thl_util.Resolvable<T> | VariantOptions<T>;

export namespace PassedOptions {
  export function resolve<T extends CppTask.Options>(options: PassedOptions<T>): T {
    if (VariantOptions.is(options)) {
      const { common, variant, additional } = options as VariantOptions<T>;
      return variant.merge(common, ...additional);
    } else {
      return thl_util.Resolvable.resolve(options);
    }
  }
}
