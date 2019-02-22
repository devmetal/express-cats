import { ICatCache } from './ICatCache';

class CatsInMemory implements ICatCache {
  private cache: Map<number, Buffer> = new Map();

  public setCat = (code: number, cat: Buffer): boolean => {
    if (this.cache.has(code)) {
      return false;
    }

    this.cache.set(code, cat);
    return true;
  };

  public getCat = (code: number): Buffer => {
    if (!this.cache.has(code)) {
      return null;
    }

    return this.cache.get(code);
  };

  public hasCat = (code: number): boolean => this.cache.has(code);
}

export { CatsInMemory };
