import { Factory, SingletonFactory } from '@utils/factory';

import { RepositoryFactories } from '@gateway/factories';
import { ISecurity } from '@gateway/security';

import {
  FakePriceRepository,
  FakeExternalPriceRepository,
  FakeUserRepository,
  FakeInvestorRepository,
  FakeWalletRepository,
  FakePositionRepository,
  FakeOperationRepository
} from './data-source/repositories';
import { encoder, tokenVerifier, tokenCreator } from './security';
import { admin, user } from './data-source/repositories/users-data';
import { ServerBuilder } from '@infra/server';

export function mockRepositories(): Factory<RepositoryFactories> {
  const prices = new SingletonFactory(() => ({
    internal: new FakePriceRepository(),
    externals: [new FakeExternalPriceRepository()],
  }));
  const factories = {
    disconnectAll: async () => [],
    prices,
    users: new SingletonFactory(() => new FakeUserRepository()),
    investors: new SingletonFactory(() => new FakeInvestorRepository()),
    wallets: new SingletonFactory(() => new FakeWalletRepository()),
    positions: new SingletonFactory(() => new FakePositionRepository(
      prices.make().internal
    )),
    operations: new SingletonFactory(() => new FakeOperationRepository()),
  };
  return new SingletonFactory(() => factories);
}

export function mockSecurity() {
  const verifier = tokenVerifier.with({
    'userToken': user,
    'adminToken': admin,
  });
  const security: ISecurity = Object.assign(encoder, {
    verifyToken: verifier.verifyToken.bind(verifier),
    createToken: tokenCreator.createToken.bind(tokenCreator),
  });
  return new SingletonFactory(() => security);
}

export function mockedServerBuilder() {
  return new ServerBuilder()
    .withRepositories(mockRepositories())
    .withSecurity(mockSecurity());
}
