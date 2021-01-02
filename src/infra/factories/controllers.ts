import { Mongo } from "@infra/database";
import { makeLastPriceLoader, makeLastRankingLoader } from "@infra/factories";
import { LoadLastPriceControllerFactory, LoadLastRankingControllerFactory } from "@presentation/factories";
import { env } from '@main/config/env';

const mongo = new Mongo(env.mongodb);
const makeLastPriceLoaderAdapter = () => makeLastPriceLoader(mongo);

export const controllerFactories = {
  price: new LoadLastPriceControllerFactory(makeLastPriceLoaderAdapter),
  ranking: new LoadLastRankingControllerFactory(makeLastRankingLoader),
};
