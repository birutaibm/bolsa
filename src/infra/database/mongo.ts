import { MongoClient, MongoClientOptions } from 'mongodb';

type MongoConfig = {
  uri: string;
  database?: string;
  connectionOptions: MongoClientOptions;
};

export class Mongo {
  private readonly client: MongoClient;
  private readonly database?: string;

  constructor(config: MongoConfig) {
    this.client = new MongoClient(config.uri, config.connectionOptions);
    this.database = config.database;
    this.connect();
  }

  connect() {
    this.client.connect().then(() => this.client.db(this.database))
  }

  close() {
    return this.client.close();
  }

  isConnected() {
    return this.client.isConnected();
  }
}
