import { AssetRepository } from '@gateway/data/contracts';
import { Factory } from '@utils/factory';
import { Pool, ClientConfig, QueryConfig } from 'pg';

import createPostgreRepositoryFactories from './repositories';

export type PostgreConfig = ClientConfig;

export default class PostgreSQL {
  private readonly pool: Pool;

  constructor(config: PostgreConfig) {
    this.pool = new Pool(config);
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
}
