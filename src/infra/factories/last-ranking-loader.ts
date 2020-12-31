import { LastRankingLoaderService } from '@data/services';
import { FakeRankingRepository } from '@infra/repositories';

export function makeLastRankingLoader(): LastRankingLoaderService {
  const repo = new FakeRankingRepository();
  return new LastRankingLoaderService(repo);
}
