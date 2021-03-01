import { ApolloServer } from 'apollo-server-express';
import { Express } from 'express';

import typeDefs from './type-defs';
import createResolvers from './resolvers';

export default class GraphQL {
  constructor(
    private readonly app: Express
  ) {}

  setup(
    controllerFactories: Parameters<typeof createResolvers>[0],
  ): void {
    const resolvers = createResolvers(controllerFactories);
    const server = new ApolloServer({
      context: async ({req}) => ({authorization: req.headers.authorization}),
      resolvers,
      typeDefs,
    });
    server.applyMiddleware({app: this.app});
  }
}
