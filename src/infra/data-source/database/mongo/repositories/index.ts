import { SingletonFactory } from '@utils/factory';

import { MongoPriceRepository } from './price';
import { MongoUserRepository } from './user';
import Mongo from '..';

export default function createFactories(mongo: Mongo) {
  const prices = new SingletonFactory(() => new MongoPriceRepository());
  const users =  new SingletonFactory(
    () => new MongoUserRepository()
  );

  return {
    prices,
    users,
  };
}
