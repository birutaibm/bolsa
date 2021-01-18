import { Mongo } from "@infra/data-source/database";
import { makeLastRankingLoader, ExternalSymbolServicesFactory } from "@infra/factories";
import { ExternalSymbolRegisterControllerFactory, ExternalSymbolSearchControllerFactory, LoadLastPriceControllerFactory, LoadLastRankingControllerFactory } from "@presentation/factories";
import { env } from '@infra/environment';

const mongo = new Mongo(env.mongodb);
const serviceFactories = new ExternalSymbolServicesFactory(mongo);
const makeLastPriceLoaderAdapter = serviceFactories.makeLastPriceLoader();
const makeExternalSymbolRegister = serviceFactories.makeExternalSymbolRegister();
const makeExternalSymbolSearch = serviceFactories.makeExternalSymbolSearch();

export const controllerFactories = {
  price: new LoadLastPriceControllerFactory(makeLastPriceLoaderAdapter),
  ranking: new LoadLastRankingControllerFactory(makeLastRankingLoader),
  symbolSearch: new ExternalSymbolSearchControllerFactory(makeExternalSymbolSearch),
  symbolRegister: new ExternalSymbolRegisterControllerFactory(makeExternalSymbolRegister),
};
