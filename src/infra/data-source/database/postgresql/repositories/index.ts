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
    const client = await db.getClient();
    let tableCreation = await client.query(`
      CREATE TABLE IF NOT EXISTS investors (
        id CHAR(24) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        created_on TIMESTAMP NOT NULL
      )`);
    tableCreation = await client.query(`
      CREATE TABLE IF NOT EXISTS wallets (
        id serial PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        owner_id CHAR(24) NOT NULL,
        created_on TIMESTAMP NOT NULL,
        FOREIGN KEY (owner_id) REFERENCES investors (id)
      )`);
    tableCreation = await client.query(`
      CREATE TABLE IF NOT EXISTS positions (
        id serial PRIMARY KEY,
        asset CHAR(24) NOT NULL,
        wallet_id INT NOT NULL,
        created_on TIMESTAMP NOT NULL,
        FOREIGN KEY (wallet_id) REFERENCES wallets (id)
      )`);
    tableCreation = await client.query(`
      CREATE TABLE IF NOT EXISTS operations (
        id serial PRIMARY KEY,
        date TIMESTAMPTZ NOT NULL,
        quantity INT NOT NULL,
        value NUMERIC(10,2) NOT NULL,
        position_id INT NOT NULL,
        created_on TIMESTAMP NOT NULL,
        FOREIGN KEY (position_id) REFERENCES positions (id)
      )`);
      client.release();
  } catch (error) {
    console.error(error);
    throw error;
  }


  const investors =  new SingletonFactory(
    () => new PostgreInvestorRepository(db, wallets)
  );
  const wallets = new SingletonFactory(
    () => new PostgreWalletRepository(db, investors, positions)
  );
  const positions = new SingletonFactory(
    () => new PostgrePositionRepository(db, wallets, operations, assets)
  );
  const operations = new SingletonFactory(
    () => new PostgreOperationRepository(db, positions)
  );

  return {
    investors,
    wallets,
    positions,
    operations,
  };
}
