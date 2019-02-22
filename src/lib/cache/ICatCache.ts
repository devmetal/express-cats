export interface ICatCache {
  setCat: (k: number, v: Buffer) => boolean;
  getCat: (k: number) => Buffer | null;
  hasCat: (k: number) => boolean;
}
