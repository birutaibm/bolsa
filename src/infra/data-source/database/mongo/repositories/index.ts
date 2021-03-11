import { SingletonFactory } from '@utils/factory';

import { MongoPriceRepository } from './price';
import { MongoUserRepository } from './user';
import { MongoWalletRepository } from './wallet';
import { MongoPositionRepository } from './position';
import { MongoOperationRepository } from './operation';
import Mongo from '..';

export default function createFactories(mongo: Mongo) {
  const prices = new SingletonFactory(() => new MongoPriceRepository());
  const operations = new SingletonFactory(() => new MongoOperationRepository(mongo));
  const positions = new SingletonFactory(
    () => new MongoPositionRepository(mongo)
  );
  const wallets = new SingletonFactory(
    () => new MongoWalletRepository(mongo)
  );
  const users =  new SingletonFactory(
    () => new MongoUserRepository()
  );

  return {
    prices,
    users,
    wallets,
    positions,
    operations,
  };
}
