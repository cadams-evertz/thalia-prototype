import * as thalia_fs from './fs';
import * as thalia_platform from './platform';
import * as thalia_process from './process';
import * as thalia_terminal from './terminal';
import * as thalia_text from './text';

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
const fx = thalia_terminal.textEffects;

export function action(message: string): void {
  if (currentOptions?.action ?? true) {
    print(console.info, fx.fg.green, message);
  }
}

export function banner(message: string): void {
  if (currentOptions?.banner ?? true) {
    const emphasis = thalia_text.unicode.BOX_DRAWINGS_HEAVY_HORIZONTAL.repeat(3);
    info(`${emphasis} ${message} ${emphasis}`);
  }
}

export function command(message: string): void {
  if (currentOptions?.command ?? true) {
    const prompt = thalia_platform.windows() ? '>' : '$';
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

  throw new thalia_process.ExitError(message, exitCode);
}

export function info(message: string): void {
  if (currentOptions?.info ?? true) {
    print(console.info, fx.fg.magenta, fx.bold.wrap(message));
  }
}

export function setOptionsWhile(options: Options, work: () => void): void {
  const previousShow = currentOptions;
  currentOptions = { ...currentOptions, ...options };
  work();
  currentOptions = previousShow;
}

export async function setOptionsWhileAsync(options: Options, work: () => Promise<void>): Promise<void> {
  const previousShow = currentOptions;
  currentOptions = { ...currentOptions, ...options };
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
  outerEffect: thalia_terminal.TextEffect,
  message: string,
): void {
  if (currentOptions?.pathConversion ?? true) {
    message = thalia_fs.Path.replaceRelative(message);
  }

  if (currentContext) {
    message = fx.reverse.wrap(`[${currentContext}]`) + ` ${message}`;
  }

  logFunction(outerEffect.wrap(message));
}
