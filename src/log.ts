import * as thl_fs from './fs';
import * as thl_platform from './platform';
import * as thl_process from './process';
import * as thl_terminal from './terminal';
import * as thl_text from './text';

interface Options {
  action?: boolean;
  banner?: boolean;
  command?: boolean;
  debug?: boolean;
  error?: boolean;
  fatalError?: boolean;
  info?: boolean;
  pathConversion?: boolean;
  warning?: boolean;
}

let currentContext: string | undefined;
let currentOptions: Options | undefined;
const fx = thl_terminal.textEffects;

export function action(message: string): void {
  if (currentOptions?.action ?? true) {
    print(console.info, fx.fg.green, message);
  }
}

export function banner(message: string): void {
  if (currentOptions?.banner ?? true) {
    const emphasis = thl_text.unicode.BOX_DRAWINGS_HEAVY_HORIZONTAL.repeat(3);
    info(`${emphasis} ${message} ${emphasis}`);
  }
}

export function command(message: string): void {
  if (currentOptions?.command ?? true) {
    const prompt = thl_platform.windows() ? '>' : '$';
    print(console.info, fx.fg.bright.white, `${prompt} ${message}`);
  }
}

export function context(contextName: string, code: () => void): void {
  const previousContext = currentContext;
  currentContext = contextName;
  code();
  currentContext = previousContext;
}

export function debug(message: string): void {
  if (currentOptions?.debug ?? true) {
    print(console.debug, fx.fg.bright.cyan, fx.italic.wrap(`DEBUG: ${message}`));
  }
}

export function error(message: string): void {
  if (currentOptions?.error ?? true) {
    print(console.info, fx.bg.red, fx.bold.wrap(`ERROR: ${message}`));
  }
}

export function fatalError(message: string, exitCode = 1): void {
  if (currentOptions?.fatalError ?? true) {
    error(message);
  }

  throw new thl_process.ExitError(message, exitCode);
}

export function info(message: string): void {
  if (currentOptions?.info ?? true) {
    print(console.info, fx.fg.magenta, fx.bold.wrap(message));
  }
}

export function setOptions(options: Options): void {
  currentOptions = { ...currentOptions, ...options };
}

export function setOptionsWhile(options: Options, work: () => void): void {
  const previousShow = currentOptions;
  setOptions(options);
  work();
  currentOptions = previousShow;
}

export async function setOptionsWhileAsync(options: Options, work: () => Promise<void>): Promise<void> {
  const previousShow = currentOptions;
  setOptions(options);
  await work();
  currentOptions = previousShow;
}

export function warning(message: string): void {
  if (currentOptions?.warning ?? true) {
    print(console.info, fx.fg.bright.yellow, fx.bold.wrap(`Warning: ${message}`));
  }
}

function print(
  logFunction: (message?: any, ...optionalParams: any[]) => void,
  outerEffect: thl_terminal.TextEffect,
  message: string,
): void {
  if (currentOptions?.pathConversion ?? true) {
    message = thl_fs.Path.replaceRelative(message);
  }

  if (currentContext) {
    message = fx.reverse.wrap(`[${currentContext}]`) + ` ${message}`;
  }

  logFunction(outerEffect.wrap(message));
}
