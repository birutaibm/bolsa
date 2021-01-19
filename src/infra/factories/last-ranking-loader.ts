import { LastRankingLoaderService } from '@data/services';
import { FakeRankingRepository } from '@infra/data-source/repositories';

export function makeLastRankingLoader(): LastRankingLoaderService {
  const repo = new FakeRankingRepository();
  return new LastRankingLoaderService(repo);
}

export const lastRankingLoaderFactory = {
  make: () => new LastRankingLoaderService(new FakeRankingRepository()),
}
