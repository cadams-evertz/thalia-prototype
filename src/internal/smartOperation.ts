export type OnlyIf<T> = 'always' | T;
export type OnlyIfCheckFunction<T> = (onlyIf: T | undefined) => boolean;

export interface SmartOperationOptions<T> {
  onlyIf?: OnlyIf<T>;
  dryRun?: boolean;
}

export function smartOperation<T>(
  onlyIfCheck: OnlyIfCheckFunction<T>,
  execute: () => void,
  options: SmartOperationOptions<T> | undefined,
): boolean {
  if (options?.onlyIf === 'always' || onlyIfCheck(options?.onlyIf)) {
    if (!options?.dryRun) {
      execute();
    }

    return true;
  } else {
    return false;
  }
}
