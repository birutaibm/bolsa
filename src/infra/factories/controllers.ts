import { Mongo } from "@infra/data-source/database";
import { lastRankingLoaderFactory, PriceRepositories } from '@infra/factories';
import { ExternalSymbolRegisterControllerFactory, ExternalSymbolSearchControllerFactory, LoadLastPriceControllerFactory, LoadLastRankingControllerFactory } from "@presentation/factories";
import { env } from '@infra/environment';
import { PriceServiceFactories } from "@data/contracts";

const mongo = new Mongo(env.mongodb);
const repositories = new PriceRepositories(mongo)
const services = new PriceServiceFactories(repositories).getAll();

export const controllerFactories = {
  price: new LoadLastPriceControllerFactory(services.lastPriceLoader),
  ranking: new LoadLastRankingControllerFactory(lastRankingLoaderFactory),
  symbolSearch: new ExternalSymbolSearchControllerFactory(services.externalSymbolSearch),
  symbolRegister: new ExternalSymbolRegisterControllerFactory(services.externalSymbolRegister),
};
