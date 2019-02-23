import express from 'express';
import supertest from 'supertest';
import { cats, CatResponse } from '../index';
import { CatsInMemory } from '../lib/cache/CatsInMemory';

const cache = new CatsInMemory();
const app = express();

app.use(cats(cache));

app.get('/cat/:code', (req, res: CatResponse) => {
  const code: number = parseInt(req.params.code, 10);
  res.sendCat(code);
});

test('quick check for 200 cat', async () => {
  const res = await supertest(app)
    .get('/cat/200')
    .expect(200);
  expect(cache.hasCat(200)).toBeTruthy();
  expect(cache.getCat(200).byteLength).toEqual(res.body.byteLength);
});
