import { SingletonFactory } from '@utils/factory';

import { MongoPriceRepository } from './price';
import { MongoUserRepository } from './user';
import { MongoWalletRepository } from './wallet';
import { PositionRepository } from './position';
import { OperationRepository } from './operation';

export default function createFactories() {
  const prices = new SingletonFactory(() => new MongoPriceRepository());
  const users =  new SingletonFactory(() => new MongoUserRepository());
  const operations = new SingletonFactory(() => new OperationRepository());
  const positions = new SingletonFactory(
    () => new PositionRepository(operations.make())
  );
  const wallets = new SingletonFactory(
    () => new MongoWalletRepository(positions.make())
  );

  return {
    prices,
    users,
    wallets,
    positions,
    operations,
  };
}
