import { DatabaseConnectionError } from '@errors/database-connection';
import mongoose, { Connection, ConnectOptions } from 'mongoose';

import createMongoRepositoryFactories from './repositories';

export type MongoConfig = {
  uri: string;
  connectionOptions: ConnectOptions;
};

export default class Mongo {
  private connection: Connection | undefined;

  constructor(private readonly config: MongoConfig) {
    this.connectWithRetry();
  }

  private connectWithRetry() {
    mongoose.connect(
      this.config.uri,
      this.config.connectionOptions,
    ).then(
      connected => this.connection = connected.connection
    ).catch(() => {
      console.error('Failed to connect mongo - retrying in 5 seconds')
      setTimeout(this.connectWithRetry.bind(this), 5000);
    });
  }

  async connect() {
    if (!this.connection) {
      try {
        // deepcode ignore Ssrf: This class is not responsibly to check this, it need to be injected correct
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

  createRepositoryFactories() {
    return createMongoRepositoryFactories(this);
  }
}
