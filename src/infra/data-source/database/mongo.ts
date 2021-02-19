import mongoose, { ConnectOptions } from 'mongoose';

type MongoConfig = {
  uri: string;
  database?: string;
  connectionOptions: ConnectOptions;
};

export default class Mongo {
  constructor(private readonly config: MongoConfig) {
    this.connect();
  }

  async connect() {
    await mongoose.connect(this.config.uri, this.config.connectionOptions);
  }
}
