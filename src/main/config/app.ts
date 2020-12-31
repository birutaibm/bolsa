import app from '@infra/server';
import { setupRoutes } from '@main/config/express-routes';
import { setupApolloServer } from '@main/config/apollo-server';

setupRoutes(app.routes);
setupApolloServer(app.apollo);

export default app;
