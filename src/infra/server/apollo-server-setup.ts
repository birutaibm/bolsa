import { ApolloServer } from 'apollo-server-express';
import { Express } from 'express';

export class ApolloServerSetup {
  constructor(
    private readonly app: Express
  ) {}

  setup(resolvers: any, typeDefs: any): void {
    const server = new ApolloServer({
      resolvers,
      typeDefs,
    });
    server.applyMiddleware({app: this.app});
  }
}
