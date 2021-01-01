import price from '@infra/server/routes/price';
import ranking from '@infra/server/routes/ranking';
import ExpressRouterSetup from '@infra/server/express-router-setup';
import { LoadLastPriceControllerFactory, LoadLastRankingControllerFactory } from '@presentation/factories';

type ControllerFactories = {
  price: LoadLastPriceControllerFactory;
  ranking: LoadLastRankingControllerFactory;
};

export function setupRoutes(
  routerSetup: ExpressRouterSetup,
  controllerFactories: ControllerFactories,
): void {
  routerSetup.use(price, controllerFactories.price);
  routerSetup.use(ranking, controllerFactories.ranking);
}
