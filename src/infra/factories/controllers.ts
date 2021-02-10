import { PriceUseCasesFactories, UserUseCasesFactories } from '@gateway/factories';
import {
  ExternalSymbolRegisterControllerFactory,
  ExternalSymbolSearchControllerFactory,
  LoadLastPriceControllerFactory,
  LoadLastRankingControllerFactory,
  UserCreatorControllerFactory,
} from '@gateway/presentation/factories';
import { SignInControllerFactory } from '@gateway/presentation/factories/sign-in-controller';

import { FakeUserRepository } from '@infra/data-source/in-memory';
import { MongoUserRepository } from '@infra/data-source/repositories/mongo-user';
import { Mongo } from '@infra/data-source/database';
import { env } from '@infra/environment';

import { lastRankingLoaderFactory } from './last-ranking-loader';
import { PriceRepositories } from './price-repositories';
import securityFactory from './security';

const mongo = new Mongo(env.mongodb);
const repositories = new PriceRepositories(mongo);
const priceServiceFactories = new PriceUseCasesFactories(repositories);
const userRepository = mongo
  ? new MongoUserRepository(mongo)
  : new FakeUserRepository();
const userServiceFactories = new UserUseCasesFactories(userRepository, securityFactory.make());
const {
  lastPriceLoader,
  externalSymbolSearch,
  externalSymbolRegister,
} = priceServiceFactories.getAll();
const {
  userCreator,
  userLoader,
  signIn,
} = userServiceFactories.getAll();

export const controllerFactories = {
  price: new LoadLastPriceControllerFactory(lastPriceLoader),

  ranking: new LoadLastRankingControllerFactory(lastRankingLoaderFactory),

  symbolSearch: new ExternalSymbolSearchControllerFactory(
    externalSymbolSearch
  ),

  symbolRegister: new ExternalSymbolRegisterControllerFactory(
    externalSymbolRegister
  ),

  userCreator: new UserCreatorControllerFactory(userCreator),

  signIn: new SignInControllerFactory(signIn)
};
