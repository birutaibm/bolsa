import { LoadLastPriceControllerFactory, LoadLastRankingControllerFactory } from '@presentation/factories';
import { makeLastPriceLoader, makeLastRankingLoader } from '@infra/factories';
import ExpressRouterSetup from '@infra/server/express-router-setup';
import price from '@infra/server/routes/price';
import ranking from '@infra/server/routes/ranking';

export function setupRoutes(routes: ExpressRouterSetup): void {
  routes.use(price, new LoadLastPriceControllerFactory(makeLastPriceLoader));
  routes.use(ranking, new LoadLastRankingControllerFactory(makeLastRankingLoader));
}
