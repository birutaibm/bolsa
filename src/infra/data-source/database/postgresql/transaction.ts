import { MayBePromise } from '@utils/types';
import { PoolClient, QueryConfig } from 'pg';

export default class Transaction {
  constructor(
    private readonly client: PoolClient
  ) {}

  async append<T=any,U=any,V=any>(
    query: QueryConfig<U[]>,
    translate?: (result: T[]) => MayBePromise<V>,
  ): Promise<V> {
    try {
      const { rows } = await this.client.query<T>(query);
      const partialResult = translate
        ? await translate(rows)
        : rows as unknown as V;
      return partialResult;
    } catch (error) {
      await this.rollback();
      throw error;
    }
  }

  async commit() {
    const result = await this.client.query('COMMIT');
    this.client.release();
    return result;
  }

  async rollback() {
    const result = await this.client.query('ROLLBACK');
    this.client.release();
    return result;
  }
}
