import { SingletonFactory } from '@utils/factory';

import { MongoPriceRepository } from './price';
import { MongoUserRepository } from './user';

export default function createFactories() {
  return {
    prices: new SingletonFactory(() => new MongoPriceRepository()),
    users:  new SingletonFactory(() => new MongoUserRepository()),
  };
}
