import { LastRankingLoaderFactory } from '@data/usecase-factories';
import { FakeRankingRepository } from '@infra/data-source/repositories';

export const lastRankingLoaderFactory = new LastRankingLoaderFactory(
  new FakeRankingRepository(),
);
