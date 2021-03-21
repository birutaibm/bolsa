import { DatabaseConnectionError } from '@errors/database-connection';
import mongoose, { Connection, ConnectOptions } from 'mongoose';

import createMongoRepositoryFactories from './repositories';

export type MongoConfig = {
  uri: string;
  connectionOptions: ConnectOptions;
};

export default class Mongo {
  private connection: Connection | undefined;

  constructor(private readonly config: MongoConfig) {}

  async connect() {
    if (!this.connection) {
      try {
        const connected = await mongoose.connect(
          this.config.uri,
          this.config.connectionOptions,
        );
        this.connection = connected.connection;
      } catch (error) {
        throw new DatabaseConnectionError('mongodb');
      }
    }
    return this.connection;
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.close();
      this.connection = undefined;
    }
  }

  isConnected() {
    return this.connection && this.connection.readyState === 1;
  }

  async createRepositoryFactories() {
    if (!this.isConnected()) {
      await this.connect();
    }

    return createMongoRepositoryFactories(this);
  }
}
