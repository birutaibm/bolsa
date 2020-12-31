import price from '@infra/server/routes/price';
import ranking from '@infra/server/routes/ranking';
import ExpressRouterSetup from '@infra/server/express-router-setup';
import { makeLastPriceLoader, makeLastRankingLoader } from '@infra/factories';
import { LoadLastPriceControllerFactory, LoadLastRankingControllerFactory } from '@presentation/factories';

export function setupRoutes(routerSetup: ExpressRouterSetup): void {
  routerSetup.use(price, new LoadLastPriceControllerFactory(makeLastPriceLoader));
  routerSetup.use(ranking, new LoadLastRankingControllerFactory(makeLastRankingLoader));
}
