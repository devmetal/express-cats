import { CatsInMemory } from '../CatsInMemory';
import { CatsInFiles } from '../CatsInFiles';

const cat1 = Buffer.from('Cute cat');
const cat2 = Buffer.from('Fluffy cat');

test('We can store cute cats in memory', () => {
  const mem = new CatsInMemory();
  mem.setCat(1, cat1);
  mem.setCat(2, cat2);

  expect(mem.hasCat(1)).toBeTruthy();
  expect(mem.hasCat(2)).toBeTruthy();
  expect(mem.hasCat(3)).toBeFalsy();

  expect(mem.getCat(1).toString()).toEqual(cat1.toString());
  expect(mem.getCat(2).toString()).toEqual(cat2.toString());
  expect(mem.getCat(3)).toEqual(null);

  expect(mem.setCat(1, Buffer.from(''))).toBeFalsy();
});

describe('We can store cute cats in', () => {
  let fsCats: CatsInFiles;

  beforeAll(() => {
    fsCats = new CatsInFiles();
  });

  afterAll(() => {
    fsCats.destroyCats();
  });

  test('file system', () => {
    fsCats.setCat(1, cat1);
    fsCats.setCat(2, cat2);

    expect(fsCats.hasCat(1)).toBeTruthy();
    expect(fsCats.hasCat(2)).toBeTruthy();
    expect(fsCats.hasCat(3)).toBeFalsy();

    expect(fsCats.getCat(1).toString()).toEqual(cat1.toString());
    expect(fsCats.getCat(2).toString()).toEqual(cat2.toString());
    expect(fsCats.getCat(3)).toEqual(null);

    expect(fsCats.setCat(1, Buffer.from(''))).toBeFalsy();
  });
});
