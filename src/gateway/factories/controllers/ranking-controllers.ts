import { Factory } from '@utils/factory';
import { LastRankingLoader } from '@domain/ranking/usecases';

import { LoadLastRankingController } from '@gateway/presentation/controllers';
import {
  ControllerFactory
} from '@gateway/factories';

type RankingControllers = {
  readonly load: Factory<LoadLastRankingController>;
}

export function createRankingControllers(
  loader: Factory<LastRankingLoader>,
): RankingControllers {
  return {
    load: new  ControllerFactory(
      () => new LoadLastRankingController(loader.make())
    ),
  };
}
