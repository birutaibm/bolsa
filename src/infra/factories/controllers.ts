import { Mongo } from "@infra/data-source/database";
import { lastRankingLoaderFactory } from '@infra/factories';
import { PriceRepositories } from '@infra/factories/price-repositories';
import { ExternalSymbolRegisterControllerFactory, ExternalSymbolSearchControllerFactory, LoadLastPriceControllerFactory, LoadLastRankingControllerFactory } from "@presentation/factories";
import { env } from '@infra/environment';
import { PriceServiceFactories } from "@data/contracts";

const mongo = new Mongo(env.mongodb);
const repositories = new PriceRepositories(mongo)
const serviceFactories = new PriceServiceFactories(repositories);
const lastPriceLoaderAdapterFactory = serviceFactories.ofLastPriceLoader();
const externalSymbolRegisterFactory = serviceFactories.ofExternalSymbolRegister();
const externalSymbolSearchFactory = serviceFactories.ofExternalSymbolSearch();

export const controllerFactories = {
  price: new LoadLastPriceControllerFactory(lastPriceLoaderAdapterFactory),
  ranking: new LoadLastRankingControllerFactory(lastRankingLoaderFactory),
  symbolSearch: new ExternalSymbolSearchControllerFactory(externalSymbolSearchFactory),
  symbolRegister: new ExternalSymbolRegisterControllerFactory(externalSymbolRegisterFactory),
};
