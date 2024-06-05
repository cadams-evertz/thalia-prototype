import * as cryptoJs from 'crypto-js';

export function md5sum(data: string | Buffer): string {
  return cryptoJs.MD5(convertCryptoData(data)).toString();
}

export function sha256sum(data: string | Buffer): string {
  return cryptoJs.SHA256(convertCryptoData(data)).toString();
}

function convertCryptoData(data: string | Buffer): string | cryptoJs.lib.WordArray {
  // @ts-ignore - create seems to accept Buffer, even though the type doesn't match correctly
  return typeof data === 'string' ? data : cryptoJs.lib.WordArray.create(data);
}
