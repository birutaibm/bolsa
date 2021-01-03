export const test = {
  port: 5000,
  mongodb: {
    uri: 'mongodb://localhost:27017/test',
    database: 'test',
    connectionOptions: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      poolSize: 1,
    },
  },
};
