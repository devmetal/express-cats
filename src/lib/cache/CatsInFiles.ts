import fs, { PathLike, stat } from 'fs';
import path from 'path';
import { ICatCache } from './ICatCache';

type CatHeader = [string, number, number];

type CatNameGetter = () => string;
type CatPosiGetter = () => number;
type CatLengthGetter = () => number;

type CatHeaderGetter = {
  name: CatNameGetter;
  posi: CatPosiGetter;
  length: CatLengthGetter;
};

const getHeader = (h: CatHeader): CatHeaderGetter => ({
  name: (): string => h[0],
  posi: (): number => h[1],
  length: (): number => h[2],
});

const makeHeader = (name: string, posi: number, length: number): CatHeader => [
  name,
  posi,
  length,
];

const fName: PathLike = path.join(process.cwd(), '.cats');
const hSize: number = 512;

let cache: number = null;

class CatsInFiles implements ICatCache {
  constructor() {
    if (cache === null) {
      cache = fs.openSync(fName, 'a+');
    }
  }

  public setCat = (key: number, value: Buffer): boolean => {
    const headers = this.getHeaders();
    const strKey = `${key}`;
    const n = headers.length;

    if (headers.some(h => getHeader(h).name() === strKey)) {
      return false;
    }

    const bLength = value.byteLength;
    let position: number;

    if (!n) {
      position = hSize;
    } else {
      const lastHeader = getHeader(headers[n - 1]);
      position = lastHeader.posi() + lastHeader.length();
    }

    fs.writeSync(cache, value, 0, bLength, position);

    const newHeader: CatHeader = makeHeader(strKey, position, bLength);
    this.writeHeaders([...headers, newHeader]);

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
    return this.getHeaders().some(h => h[0] === `${k}`);
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

  private writeHeaders = (headers: CatHeader[]): void => {
    const hs = headers.map(h => h.join(',')).join('\n');
    const bf = Buffer.alloc(hSize);
    bf.write(`${hs}END`);
    fs.writeSync(cache, bf, 0, hSize, 0);
  };
}

export { CatsInFiles };
