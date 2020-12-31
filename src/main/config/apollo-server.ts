import { ApolloServer } from '@infra/server/apollo-server';
import typeDefs from '@main/graphql/type-defs';
import resolvers from '@main/graphql/resolvers';

export function setupApolloServer(apollo: ApolloServer): void {
  apollo.setup(resolvers, typeDefs);
}
