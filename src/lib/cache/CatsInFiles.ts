import fs, { PathLike, stat } from 'fs';
import path from 'path';
import { ICatCache } from './ICatCache';

class CatHeader {
  code: number;
  size: number;
  position: number;
}

class CatsInFiles implements ICatCache {
  private static instance: CatsInFiles;

  public static getInstance(): CatsInFiles {
    if (undefined === CatsInFiles.instance) {
      CatsInFiles.instance = new CatsInFiles();
    }
    return CatsInFiles.instance;
  }

  private cacheHeadersSize: number = 512;

  private cacheFileName: PathLike;

  private cacheFilePtr: number;

  private cacheHeaders: CatHeader[];

  private constructor() {
    this.cacheFileName = path.join(process.cwd(), '.cats');
    this.cacheFilePtr = fs.openSync(this.cacheFileName, 'a+');
    this.cacheHeaders = this.getHeaders();
  }

  public setCat = (key: number, value: Buffer): boolean => {
    const n = this.cacheHeaders.length;

    if (this.hasCat(key)) {
      return false;
    }

    const size = value.byteLength;
    let position: number;

    if (!n) {
      position = this.cacheHeadersSize;
    } else {
      const lastHeader = this.cacheHeaders[n - 1];
      position = lastHeader.position + lastHeader.size;
    }

    fs.writeSync(this.cacheFilePtr, value, 0, size, position);

    const newHeader: CatHeader = new CatHeader();
    newHeader.size = size;
    newHeader.position = position;
    newHeader.code = key;

    this.cacheHeaders = [...this.cacheHeaders, newHeader];
    this.writeHeaders();

    return true;
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
    return this.cacheHeaders.some(h => h.code === k);
  };

  public destroyCats = (): boolean => {
    if (cache === null) {
      return false;
    }

    fs.closeSync(cache);
    fs.unlinkSync(fName);
  };

  private getHeaders = (): CatHeader[] => {
    const bf = Buffer.alloc(hSize);
    fs.readSync(cache, bf, 0, hSize, 0);
    const headersRaw = bf.toString();

    if (headersRaw.includes('END')) {
      return headersRaw
        .split('END')[0]
        .split('\n')
        .map(rh => {
          const h = rh.split(',');
          const code: string = `${h[0]}`;
          const from: number = parseInt(h[1], 10);
          const len: number = parseInt(h[2], 10);

          return [code, from, len] as CatHeader;
        });
    }

    return [];
  };

  private writeHeaders = (): void => {
    const hs = headers.map(h => h.join(',')).join('\n');
    const bf = Buffer.alloc(hSize);
    bf.write(`${hs}END`);
    fs.writeSync(cache, bf, 0, hSize, 0);
  };
}

export { CatsInFiles };
