import * as thl_process from './process';

const codenameMappings: Record<string, number> = {
  trusty: 1404,
  xenial: 1604,
  bionic: 1804,
  focal: 2004,
  jammy: 2204,
  noble: 2404,
};

let _codename: string | undefined;

export function codename(): string {
  if (linux()) {
    if (!_codename) {
      _codename =
        thl_process
          .execute('lsb_release -c', { captureOutput: true, echoCommand: false })
          .output?.match(/Codename:[ \t]+([a-z]+)/)?.[1] ?? 'linux';
    }

    return _codename;
  } else if (mac()) {
    return 'mac';
  } else if (windows()) {
    return 'windows';
  } else {
    return 'unknown';
  }
}

export function codenameNumeric(codename: string): number {
  const result = codenameMappings[codename];

  if (!result) {
    throw new Error(`Numeric mapping not found for codename: ${codename}`);
  }

  return result;
}

export function linux(): boolean {
  return process.platform === 'linux';
}

export function mac(): boolean {
  return process.platform === 'darwin';
}

export function windows(): boolean {
  return process.platform === 'win32';
}
