import 'dotenv/config';
import { test } from './test';

const mongodb = (process.env.NODE_ENV === 'test')
  ? test.mongodb
  : {
    uri: process.env.MONGODB_URL || 'mongodb://localhost:27017/dev',
    database: process.env.MONGODB_DATABASE,
    connectionOptions: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      poolSize: parseInt(process.env.MONGODB_POOL_SIZE || '10'),
    },
  };

export const env = {
  port: process.env.PORT || 3000,
  mongodb,
};
