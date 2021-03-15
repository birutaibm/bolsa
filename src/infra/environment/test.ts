import { PostgreConfig } from "@infra/data-source/database/postgresql";

export const test = {
  port: 5000,
  mongodb: {
    uri: 'mongodb://localhost:27017/',
    connectionOptions: {
      dbName: 'test',
      useNewUrlParser: true,
      useUnifiedTopology: true,
      poolSize: 1,
    },
  },
  postgre: {
    user: 'test',
    host: 'localhost',
    database: 'test',
    password: 'testPassword',
    port: Number('5432'),
  },
};
