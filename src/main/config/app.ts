import app, { routerSetup, graphqlSetup } from '@infra/server';
import { setupRoutes } from '@main/config/routes';
import { setupApolloServer } from '@main/config/apollo-server';

setupRoutes(routerSetup);
setupApolloServer(graphqlSetup);

export default app;
