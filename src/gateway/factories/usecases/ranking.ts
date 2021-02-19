import { SingletonFactory } from '@utils/factory';
import { LastRankingLoader } from '@domain/ranking/usecases';
import { LoadLastRankingRepository } from '@gateway/data/contracts';

export default function createRankingUseCasesFactories(
  repository: LoadLastRankingRepository,
) {
  const loader = new SingletonFactory(
    () => new LastRankingLoader(repository)
  );

  return {
    loader,
  };
}
