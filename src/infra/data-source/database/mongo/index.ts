import { DatabaseConnectionError } from '@errors/database-connection';
import mongoose, { ConnectOptions } from 'mongoose';

import createMongoRepositoryFactories from './repositories';

export type MongoConfig = {
  uri: string;
  database?: string;
  connectionOptions: ConnectOptions;
};

export default class Mongo {
  private connection: typeof mongoose;

  constructor(private readonly config: MongoConfig) {}

  async connect() {
    if (!this.connection) {
      try {
        this.connection = await mongoose.connect(
          this.config.uri,
          this.config.connectionOptions,
        );
      } catch (error) {
        throw new DatabaseConnectionError('mongodb');
      }
    }
    return this.connection;
  }

  isConnected() {
    return this.connection !== undefined;
  }

  async createRepositoryFactories() {
    if (!this.isConnected()) {
      await this.connect();
    }

    return createMongoRepositoryFactories();
  }
}
