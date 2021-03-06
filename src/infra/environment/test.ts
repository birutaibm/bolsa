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
};
