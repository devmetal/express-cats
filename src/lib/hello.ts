import { CatsInMemory } from './cache/CatsInMemory';

const send = (who: string): string => `Hello ${who}`;

const cats = new CatsInMemory();

export default send;
