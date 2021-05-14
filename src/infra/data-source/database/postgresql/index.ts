import { Pool, ClientConfig, QueryConfig, QueryResult } from 'pg';
import fs from 'fs';
import path from 'path';

import {
  RepositoryChangeCommand, RepositoryChangeCommandExecutor,
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
    if (this.isConnected()) return;
    try {
      const sql = fs.readFileSync(path.resolve(__dirname, 'init-db.sql')).toString();
      const commands = sql.split(';\n').map(cmd => `${cmd.replace(/\s+/g, ' ')};`);
      this.pool.connect().then(client =>
        Promise.all(commands.map(cmd => client.query(cmd))).then(() => {
          client.release();
          this.ready = true;
        })
      ).catch(() => {
        console.error('Failed to connect PostgreSQL - retrying in 5 seconds')
        setTimeout(this.connectWithRetry.bind(this), 5000);
      });
    } catch (error) {
      console.error(error);
    }
  }

  isConnected() {
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

  createRepositoryFactories() {
    return createPostgreRepositoryFactories(this);
  }
}
