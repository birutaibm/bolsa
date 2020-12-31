import { ApolloServer } from 'apollo-server-express';
import { Express } from 'express';

import typeDefs from '@main/graphql/type-defs';
import resolvers from '@main/graphql/resolvers';
import { ApolloServerSetup } from '@infra/server/apollo-server-setup';

export function setupApolloServer(apolloServer: ApolloServerSetup): void {
  apolloServer.setup(resolvers, typeDefs);
}
