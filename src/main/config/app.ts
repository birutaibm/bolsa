import app from '@infra/server';
import { setupRoutes } from '@main/config/routes';
import { setupApolloServer } from '@main/config/apollo-server';

setupRoutes(app);
setupApolloServer(app);

export default app;
