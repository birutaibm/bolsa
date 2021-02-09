import { PriceUseCasesFactories, UserCreatorFactory } from '@gateway/data/factories';
import {
  ExternalSymbolRegisterControllerFactory,
  ExternalSymbolSearchControllerFactory,
  LoadLastPriceControllerFactory,
  LoadLastRankingControllerFactory,
  UserCreatorControllerFactory,
} from '@gateway/presentation/factories';
import { SignInControllerFactory } from '@gateway/presentation/factories/sign-in-controller';
import { SignInFactory } from '@gateway/security/factories/sign-in';
import { UserLoaderFactory } from '@gateway/data/factories/user-loader';

import { signIn } from '@infra/security/jwt';
import { FakeUserRepository } from '@infra/data-source/in-memory';
import { MongoUserRepository } from '@infra/data-source/repositories/mongo-user';
import { Mongo } from '@infra/data-source/database';
import { env } from '@infra/environment';

import { lastRankingLoaderFactory } from './last-ranking-loader';
import { PriceRepositories } from './price-repositories';

const mongo = new Mongo(env.mongodb);
const repositories = new PriceRepositories(mongo);
const priceServiceFactories = new PriceUseCasesFactories(repositories);
const userRepository = mongo
  ? new MongoUserRepository(mongo)
  : new FakeUserRepository();
const userCreatorFactories = new UserCreatorFactory(userRepository);
const {
  lastPriceLoader,
  externalSymbolSearch,
  externalSymbolRegister,
} = priceServiceFactories.getAll();

export const controllerFactories = {
  price: new LoadLastPriceControllerFactory(lastPriceLoader),

  ranking: new LoadLastRankingControllerFactory(lastRankingLoaderFactory),

  symbolSearch: new ExternalSymbolSearchControllerFactory(
    externalSymbolSearch
  ),

  symbolRegister: new ExternalSymbolRegisterControllerFactory(
    externalSymbolRegister
  ),

  userCreator: new UserCreatorControllerFactory(userCreatorFactories),

  signIn: new SignInControllerFactory(new SignInFactory(
    signIn,
    new UserLoaderFactory(userRepository)
  ))
};
