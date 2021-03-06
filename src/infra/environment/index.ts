import 'dotenv/config';
import { test } from './test';

const mongodb = (process.env.NODE_ENV === 'test')
  ? test.mongodb
  : {
    uri: process.env.MONGODB_URL || 'mongodb://localhost:27017/',
    connectionOptions: {
      dbName: process.env.MONGODB_DATABASE || 'dev',
      autoIndex: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      poolSize: parseInt(process.env.MONGODB_POOL_SIZE || '10'),
    },
  };

export const env = {
  port: process.env.PORT || 3000,
  mongodb,
  jwt: {
    secret: process.env.JWT_SECRET || 'não tenho segredo',
    duration: process.env.JWT_DURATION || '1h',
    privateKey: process.env.JWT_PRIVATE_KEY || 'chave? que chave?',
    publicKey: process.env.JWT_PUBLIC_KEY || 'se a chave é pública, melhor nem trancar',
  },
  externalPrices: {
    alphavantageKey: process.env.ALPHAVANTAGE_API_KEY || '',
  }
};
