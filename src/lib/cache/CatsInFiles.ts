import fs, { PathLike, stat } from 'fs';
import path from 'path';
import { ICatCache } from './ICatCache';

type CatHeader = [string, number, number];

const fName: PathLike = path.join(process.cwd(), '.cats');
const hSize: number = 512;

let cache: number = null;

class CatsInFiles implements ICatCache {
  constructor() {
    if (cache === null) {
      // Mode a+: Open file for reading and appending.
      // The file is created if it does not exist.
      cache = fs.openSync(fName, 'a+');
    }
  }

  public setCat = (k: number, v: Buffer): boolean => {
    const headers = this.getHeaders();
    if (headers.some(h => h[0] === `${k}`)) {
      return false;
    }

    const bLength = v.byteLength;

    if (!headers.length) {
      fs.writeSync(cache, v, 0, bLength, hSize);
      const header: CatHeader = [`${k}`, hSize, bLength];
      this.writeHeaders([header]);
      return true;
    }
  };

  public getCat = (k: number): Buffer => {
    const header = this.getHeaders().find(h => h[0] === `${k}`);

    if (!header) {
      return null;
    }

    const [, start, length] = header;
    const bf = Buffer.alloc(length);
    fs.readSync(cache, bf, 0, length, start);

    return bf;
  };

  public hasCat = (k: number): boolean => {
    return this.getHeaders().some(h => h[0] === `${k}`);
  };

  private getHeaders = (): CatHeader[] => {
    const bf = Buffer.alloc(hSize);
    fs.readSync(cache, bf, 0, hSize, 0);
    return bf
      .toString()
      .split('\n')
      .map(h => h.split(',') as CatHeader);
  };

  private writeHeaders = (headers: CatHeader[]): void => {
    const hs = headers.map(h => h.join(',')).join('\n');
    const bf = Buffer.alloc(hSize);
    bf.write(hs);
    fs.writeSync(cache, bf, 0, hSize, 0);
  };
}

export { CatsInFiles };
