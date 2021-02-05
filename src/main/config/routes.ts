import price from '@infra/server/routes/price';
import getSymbol from '@infra/server/routes/get-symbol';
import postSymbol from '@infra/server/routes/post-symbol';
import ranking from '@infra/server/routes/ranking';
import ExpressRouterSetup from '@infra/server/express-router-setup';

import {
  ExternalSymbolRegisterControllerFactory,
  ExternalSymbolSearchControllerFactory,
  LoadLastPriceControllerFactory,
  LoadLastRankingControllerFactory
} from '@presentation/factories';

type ControllerFactories = {
  price: LoadLastPriceControllerFactory;
  ranking: LoadLastRankingControllerFactory;
  symbolSearch: ExternalSymbolSearchControllerFactory;
  symbolRegister: ExternalSymbolRegisterControllerFactory;
};

export function setupRoutes(
  routerSetup: ExpressRouterSetup,
  controllerFactories: ControllerFactories,
): void {
  routerSetup.use(price, controllerFactories.price);
  routerSetup.use(ranking, controllerFactories.ranking);
  routerSetup.use(getSymbol, controllerFactories.symbolSearch);
  routerSetup.use(postSymbol, controllerFactories.symbolRegister);
}
