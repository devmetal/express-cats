import { Request, Response, NextFunction } from 'express';
import request from 'request';
import { ICatCache } from './lib/cache/ICatCache';
import { CatsInMemory } from './lib/cache/CatsInMemory';
import { validCats } from './lib/codes';

interface CatResponse extends Response {
  sendCat: (code: number) => void;
  cats: ICatCache;
}

const cats = (cache: ICatCache = new CatsInMemory()) => (
  req: Request,
  res: CatResponse,
  next: NextFunction,
) => {
  res.sendCat = (code: number): void => {
    if (cache.hasCat(code)) {
      const cat = cache.getCat(code);
      res
        .set('Content-Type', 'image/jpeg')
        .status(code)
        .send(cat);

      return;
    }

    if (!validCats.includes(code)) {
      res.status(code).send('Ok, but no cat here :/');
      return;
    }

    const temp: Buffer[] = [];
    const stream = request(`https://http.cat/${code}`);

    res.status(code);

    stream
      .on('data', (data: Buffer) => {
        temp.push(data);
      })
      .on('end', () => {
        const buffer = Buffer.concat(temp);
        cache.setCat(code, buffer);
        res
          .set('Content-Type', 'image/jpeg')
          .status(code)
          .send(buffer);
      });
  };

  next();
};

export { cats, CatResponse };
