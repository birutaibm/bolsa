import { Factory } from '@utils/factory';

import { LoadLastRankingRepository } from '@gateway/data/contracts';
import { LoadLastRankingController } from '@gateway/presentation/controllers';
import {
  ControllerFactory, RankingUseCasesFactories
} from '@gateway/factories';

type RankingControllers = {
  readonly load: Factory<LoadLastRankingController>;
}

export function createRankingControllers(
  repository: Factory<LoadLastRankingRepository>,
): RankingControllers {
  const useCases = new RankingUseCasesFactories(repository.make());
  const { loader } = useCases.getAll();
  return {
    load: new  ControllerFactory(
      () => new LoadLastRankingController(loader.make())
    ),
  };
}
