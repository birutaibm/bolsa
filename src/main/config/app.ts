import app from '@infra/server';
import { setupRoutes } from '@main/config/routes';
import { setupApolloServer } from '@main/config/apollo-server';
import ExpressRouterSetup from '@infra/server/express-router-setup';

setupRoutes(new ExpressRouterSetup(app));
setupApolloServer(app);

export default app;
