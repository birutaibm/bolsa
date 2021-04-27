import { Factory, SingletonFactory } from '@utils/factory';

import { AssetRepository } from '@gateway/data/contracts';

import PostgreSQL from '..';

import { PostgreInvestorRepository } from './investor';
import { PostgreWalletRepository } from './wallet';
import { PostgrePositionRepository } from './position';
import { PostgreOperationRepository } from './operation';

export default async function createFactories(
  db: PostgreSQL, assets: Factory<AssetRepository>
) {
  try {
    await db.query({text: `
      CREATE TABLE IF NOT EXISTS investors (
        id CHAR(24) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        created_on TIMESTAMP NOT NULL
      );
      CREATE TABLE IF NOT EXISTS wallets (
        id serial PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        owner_id CHAR(24) NOT NULL,
        created_on TIMESTAMP NOT NULL,
        FOREIGN KEY (owner_id) REFERENCES investors (id)
      );
      CREATE TABLE IF NOT EXISTS positions (
        id serial PRIMARY KEY,
        asset CHAR(24) NOT NULL,
        wallet_id INT NOT NULL,
        created_on TIMESTAMP NOT NULL,
        FOREIGN KEY (wallet_id) REFERENCES wallets (id)
      );
      CREATE TABLE IF NOT EXISTS operations (
        id serial PRIMARY KEY,
        date TIMESTAMPTZ NOT NULL,
        quantity INT NOT NULL,
        value NUMERIC(10,2) NOT NULL,
        position_id INT NOT NULL,
        created_on TIMESTAMP NOT NULL,
        FOREIGN KEY (position_id) REFERENCES positions (id)
      );`});
  } catch (error) {
    console.error(error);
    throw error;
  }


  const operations = new SingletonFactory(
    () => new PostgreOperationRepository(db)
  );
  const positions = new SingletonFactory(
    () => new PostgrePositionRepository(db, operations, assets)
  );
  const wallets = new SingletonFactory(
    () => new PostgreWalletRepository(db, positions)
  );
  const investors =  new SingletonFactory(
    () => new PostgreInvestorRepository(db, wallets)
  );

  return {
    investors,
    wallets,
    positions,
    operations,
  };
}
