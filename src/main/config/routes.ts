import price from '@infra/server/routes/price';
import ranking from '@infra/server/routes/ranking';
import { makeLoadLastPriceController, makeLoadLastRankingController } from '@main/factories';
import ExpressRouterSetup from '@infra/server/express-router-setup';

export function setupRoutes(routerSetup: ExpressRouterSetup): void {
  routerSetup.use(price, {make: makeLoadLastPriceController});
  routerSetup.use(ranking, {make: makeLoadLastRankingController});
}
