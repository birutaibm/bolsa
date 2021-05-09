import { Pool, ClientConfig, QueryConfig, QueryResult } from 'pg';

import { Factory } from '@utils/factory';

import {
  AssetRepository, RepositoryChangeCommand, RepositoryChangeCommandExecutor,
  RepositoryChangeCommandExecutors
} from '@gateway/data/contracts';

import createPostgreRepositoryFactories from './repositories';

export type PostgreConfig = ClientConfig;
export type Executor<T=any> = (queryConfig: QueryConfig<any[]>) => Promise<QueryResult<T>>;

export default class PostgreSQL implements RepositoryChangeCommandExecutors<Executor> {
  private readonly pool: Pool;
  private ready: boolean;

  constructor(config: PostgreConfig) {
    this.pool = new Pool(config);
    this.ready = false;
    this.connectWithRetry();
  }

  private connectWithRetry() {
    this.pool.connect().then(client =>
      Promise.all([
        client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`),
        client.query(`
          CREATE TABLE IF NOT EXISTS users (
            id uuid DEFAULT uuid_generate_v1 (),
            created_on TIMESTAMP NOT NULL,
            username VARCHAR(100) NOT NULL,
            pass_hash VARCHAR(100) NOT NULL,
            role VARCHAR(5) NOT NULL,
            PRIMARY KEY (id)
          );
        `),
        client.query(`
          CREATE TABLE IF NOT EXISTS investors (
            id UUID PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            created_on TIMESTAMP NOT NULL,
            FOREIGN KEY (id) REFERENCES users (id)
          );
        `),
        client.query(`
          CREATE TABLE IF NOT EXISTS wallets (
            id serial PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            owner_id UUID NOT NULL,
            created_on TIMESTAMP NOT NULL,
            FOREIGN KEY (owner_id) REFERENCES investors (id)
          );
        `),
        client.query(`
          CREATE TABLE IF NOT EXISTS positions (
            id serial PRIMARY KEY,
            asset CHAR(24) NOT NULL,
            wallet_id INT NOT NULL,
            created_on TIMESTAMP NOT NULL,
            FOREIGN KEY (wallet_id) REFERENCES wallets (id)
          );
        `),
        client.query(`
          CREATE TABLE IF NOT EXISTS operations (
            id serial PRIMARY KEY,
            date TIMESTAMPTZ NOT NULL,
            quantity INT NOT NULL,
            value NUMERIC(10,2) NOT NULL,
            position_id INT NOT NULL,
            created_on TIMESTAMP NOT NULL,
            FOREIGN KEY (position_id) REFERENCES positions (id)
          );
        `),
      ]).then(() => {
        client.release();
        this.ready = true;
      })
    ).catch(() => {
      console.error('Failed to connect PostgreSQL - retrying in 5 seconds')
      setTimeout(this.connectWithRetry.bind(this), 5000);
    });
  }

  async isConnected() {
    return this.ready;
  }

  private async waitConnection() {
    return new Promise<void>((resolve, reject) => {
      const resolveOnReady = () => {
        if (this.ready) resolve();
        else {
          console.log('waiting db connection...');
          setTimeout(resolveOnReady, 5000);
        }
      };
      resolveOnReady();
    });
  }

  async singleCommandExecutor<T>(command: RepositoryChangeCommand<T, any>): Promise<T> {
    if (!this.isConnected()) {
      await this.waitConnection();
    }

    const client = await this.pool.connect();
    const response = await command(client.query.bind(client));
    client.release();
    return response;
  }

  async multiCommandExecutor(): Promise<RepositoryChangeCommandExecutor<Executor>> {
    if (!this.isConnected()) {
      await this.waitConnection();
    }

    const client = await this.pool.connect();
    await client.query({ text: 'BEGIN' });
    const executor: RepositoryChangeCommandExecutor<Executor> = {
      async append(command) {
        return await command(client.query.bind(client));
      },
      async execute() {
        await client.query('COMMIT');
        client.release();
      },
      async cancel() {
        await client.query('ROLLBACK');
        client.release();
      }
    };
    return executor;
  }

  disconnect() {
    return this.pool.end();
  }

  async query<T=any,U=any>(query: QueryConfig<U[]>): Promise<T[]> {
    if (!this.isConnected()) {
      await this.waitConnection();
    }

    const client = await this.pool.connect();
    const { rows } = await client.query<T>(query);
    client.release();
    return rows;
  }

  createRepositoryFactories(assets: Factory<AssetRepository>) {
    return createPostgreRepositoryFactories(this, assets);
  }
}
