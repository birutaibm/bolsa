import { Factory, SingletonFactory } from '@utils/factory';

import { AssetRepository } from '@gateway/data/contracts';

import PostgreSQL from '..';

import { PostgreInvestorRepository } from './investor';
import { PostgreWalletRepository } from './wallet';
import { PostgrePositionRepository } from './position';
import { PostgreOperationRepository } from './operation';
import { PostgreUserRepository } from './user';
import { PostgrePriceRepository } from './price';

export default function createFactories(
  db: PostgreSQL
) {
  const prices = new SingletonFactory(
    () => new PostgrePriceRepository(db)
  );
  const operations = new SingletonFactory(
    () => new PostgreOperationRepository(db)
  );
  const positions = new SingletonFactory(
    () => new PostgrePositionRepository(db, operations)
  );
  const wallets = new SingletonFactory(
    () => new PostgreWalletRepository(db, positions)
  );
  const investors =  new SingletonFactory(
    () => new PostgreInvestorRepository(db, wallets)
  );
  const users = new SingletonFactory(
    () => new PostgreUserRepository(db)
  );

  return {
    prices,
    users,
    investors,
    wallets,
    positions,
    operations,
  };
}
