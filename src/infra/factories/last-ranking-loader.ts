import { LastRankingLoaderService } from '@data/services';
import { SingletonFactory } from '@domain/utils';
import { FakeRankingRepository } from '@infra/data-source/repositories';

export const lastRankingLoaderFactory = new SingletonFactory(
  () => new LastRankingLoaderService(new FakeRankingRepository()),
);
