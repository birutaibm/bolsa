import { makeLastPriceLoader, makeLastRankingLoader } from "@infra/factories";
import { LoadLastPriceControllerFactory, LoadLastRankingControllerFactory } from "@presentation/factories";

export const controllerFactories = {
  price: new LoadLastPriceControllerFactory(makeLastPriceLoader),
  ranking: new LoadLastRankingControllerFactory(makeLastRankingLoader),
};
