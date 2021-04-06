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

  constructor(config: PostgreConfig) {
    this.pool = new Pool(config);
  }

  async singleCommandExecutor<T>(command: RepositoryChangeCommand<T, any>): Promise<T> {
    const client = await this.pool.connect();
    const response = await command(client.query.bind(client));
    client.release();
    return response;
  }

  async multiCommandExecutor(): Promise<RepositoryChangeCommandExecutor<Executor>> {
    const client = await this.pool.connect();
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
    const client = await this.pool.connect();
    const { rows } = await client.query<T>(query);
    client.release();
    return rows;
  }

  async createRepositoryFactories(assets: Factory<AssetRepository>) {
    return createPostgreRepositoryFactories(this, assets);
  }
}
