import { AssetRepository, RepositoryChangeCommand, RepositoryChangeCommandExecutor, RepositoryChangeCommandExecutors } from '@gateway/data/contracts';
import { Factory } from '@utils/factory';
import { MayBePromise } from '@utils/types';
import { Pool, ClientConfig, QueryConfig, QueryResult, PoolClient } from 'pg';

import createPostgreRepositoryFactories from './repositories';
import Transaction from './transaction';

export type PostgreConfig = ClientConfig;
export type Executor<T=any> = (queryConfig: QueryConfig<any[]>) => Promise<QueryResult<T>>;

class CommandExecutor implements RepositoryChangeCommandExecutor<Executor> {
  constructor(
    private readonly client: PoolClient,
  ) {}

  append<T>(command: RepositoryChangeCommand<T, Executor<any>>): MayBePromise<T> {
    throw new Error('Method not implemented.');
  }
  execute(): MayBePromise<void> {
    throw new Error('Method not implemented.');
  }
  cancel(): MayBePromise<void> {
    throw new Error('Method not implemented.');
  }
}

export default class PostgreSQL implements RepositoryChangeCommandExecutors<Executor> {
  private readonly pool: Pool;

  constructor(config: PostgreConfig) {
    this.pool = new Pool(config);
  }

  async singleCommandExecutor(): Promise<RepositoryChangeCommandExecutor<Executor>> {
    const client = await this.getClient();
    const executor: RepositoryChangeCommandExecutor<Executor> = {
      async append(command) {
        return await command(client.query.bind(client));
      },
      execute() {
        client.release();
      },
      cancel() {
        client.release();
      }
    };
    return executor;
  }

  async multiCommandExecutor(): Promise<RepositoryChangeCommandExecutor<Executor>> {
    const client = await this.getClient();
    await client.query({ text: 'BEGIN' });
    const executor: RepositoryChangeCommandExecutor<Executor> = {
      async append(command) {
        return await command(client.query);
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
    const client = await this.getClient();
    const { rows } = await client.query<T>(query);
    client.release();
    return rows;
  }

  getClient() {
    return this.pool.connect();
  }

  async createRepositoryFactories(assets: Factory<AssetRepository>) {
    return createPostgreRepositoryFactories(this, assets);
  }

  async createTransaction() {
    const client = await this.getClient();
    await client.query({ text: 'BEGIN' });
    return new Transaction(client);
  }
}
