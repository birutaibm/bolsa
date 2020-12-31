import 'dotenv/config';

export const env = {
  port: process.env.PORT || 5000,
  mongodb: {
    uri: process.env.MONGODB_URL || 'mongodb://localhost:27017/dev',
    database: process.env.MONGODB_DATABASE,
    connectionOptions: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      poolSize: parseInt(process.env.MONGODB_POOL_SIZE || '10'),
    },
  },
};
