export async function asyncSmartOperation<T>(
  options: smartOperation.Options<T>,
  onlyIfArgs: T,
  execute: () => Promise<void>,
): Promise<boolean> {
  if (!options.if || options.if(onlyIfArgs)) {
    if (!options.dryRun) {
      await execute();
    }

    return true;
  } else {
    return false;
  }
}

export function smartOperation<T>(options: smartOperation.Options<T>, onlyIfArgs: T, execute: () => void): boolean {
  if (!options.if || options.if(onlyIfArgs)) {
    if (!options.dryRun) {
      execute();
    }

    return true;
  } else {
    return false;
  }
}

export namespace smartOperation {
  export interface Options<T> {
    if?: (args: T) => boolean;
    dryRun?: boolean;
  }
}
