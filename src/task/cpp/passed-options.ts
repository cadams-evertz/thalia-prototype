import * as thl_util from '../../util';

import { CppTask } from './cpp-task';
import { Variant } from './variant';

export type PassedOptions<T extends CppTask.Options> =
  | thl_util.Resolvable<T>
  | [thl_util.Resolvable<T>, Variant, ...thl_util.Resolvable<Partial<T>>[]];

export namespace PassedOptions {
  export function resolve<T extends CppTask.Options>(options: PassedOptions<T>): T {
    if (Array.isArray(options)) {
      const [base, variant, ...mixins] = options;
      return variant.merge(base, ...mixins);
    } else {
      return thl_util.Resolvable.resolve(options as T);
    }
  }
}
