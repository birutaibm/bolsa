import { LoadLastPriceControllerFactory } from '@presentation/factories';
import { makeLastPriceLoader } from '@infra/factories';
import ExpressRouterSetup from '@infra/server/express-router-setup';
import price from '@infra/server/routes/price';

export function setupRoutes(routes: ExpressRouterSetup): void {
  routes.use(price, new LoadLastPriceControllerFactory(makeLastPriceLoader));
}
