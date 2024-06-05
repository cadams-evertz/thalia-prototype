import * as thalia_process from './process';

export function codename(): string {
  if (linux()) {
    return (
      thalia_process
        .execute('lsb_release -c', { captureOutput: true, echoCommand: false })
        .output.match(/Codename:[ \t]+([a-z]+)/)?.[1] ?? 'linux'
    );
  } else {
    return 'windows';
  }
}

export function linux(): boolean {
  return process.platform === 'linux';
}

export function windows(): boolean {
  return process.platform === 'win32';
}
