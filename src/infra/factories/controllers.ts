import { Mongo } from "@infra/data-source/database";
import { makeLastPriceLoader, makeLastRankingLoader, makeExternalSymbolSearch } from "@infra/factories";
import { ExternalSymbolSearchControllerFactory, LoadLastPriceControllerFactory, LoadLastRankingControllerFactory } from "@presentation/factories";
import { env } from '@infra/environment';

const mongo = new Mongo(env.mongodb);
const makeLastPriceLoaderAdapter = () => makeLastPriceLoader(mongo);

export const controllerFactories = {
  price: new LoadLastPriceControllerFactory(makeLastPriceLoaderAdapter),
  ranking: new LoadLastRankingControllerFactory(makeLastRankingLoader),
  symbolSearch: new ExternalSymbolSearchControllerFactory(makeExternalSymbolSearch),
};
