import { Mongo } from "@infra/data-source/database";
import { makeLastPriceLoader, makeLastRankingLoader, ExternalSymbolServicesFactory } from "@infra/factories";
import { ExternalSymbolRegisterControllerFactory, ExternalSymbolSearchControllerFactory, LoadLastPriceControllerFactory, LoadLastRankingControllerFactory } from "@presentation/factories";
import { env } from '@infra/environment';

const mongo = new Mongo(env.mongodb);
const makeLastPriceLoaderAdapter = () => makeLastPriceLoader(mongo);
const externalSymbolServices = new ExternalSymbolServicesFactory();
const makeExternalSymbolRegister = externalSymbolServices.makeExternalSymbolRegister();
const makeExternalSymbolSearch = externalSymbolServices.makeExternalSymbolSearch();

export const controllerFactories = {
  price: new LoadLastPriceControllerFactory(makeLastPriceLoaderAdapter),
  ranking: new LoadLastRankingControllerFactory(makeLastRankingLoader),
  symbolSearch: new ExternalSymbolSearchControllerFactory(makeExternalSymbolSearch),
  symbolRegister: new ExternalSymbolRegisterControllerFactory(makeExternalSymbolRegister),
};
