import mongoose, { ConnectOptions } from 'mongoose';

type MongoConfig = {
  uri: string;
  database?: string;
  connectionOptions: ConnectOptions;
};

export class Mongo {
  constructor(private readonly config: MongoConfig) {
    this.connect();
  }

  connect() {
    mongoose.connect(this.config.uri, this.config.connectionOptions);
  }
}
