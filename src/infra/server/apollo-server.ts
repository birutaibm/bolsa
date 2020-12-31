import { ApolloServer as Server } from 'apollo-server-express';
import { Express } from 'express';

export class ApolloServer {
  constructor(
    private readonly app: Express
  ) {}

  setup(resolvers: any, typeDefs: any): void {
    const server = new Server({
      resolvers,
      typeDefs,
    });
    server.applyMiddleware({app: this.app});
  }
}
