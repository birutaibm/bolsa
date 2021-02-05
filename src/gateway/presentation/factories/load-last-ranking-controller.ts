import { LastRankingLoader } from '@domain/ranking/usecases';
import { Factory } from '@utils/factory';
import { LoadLastRankingController } from '@gateway/presentation/controllers';
import { ControllerFactory } from '.';

export class LoadLastRankingControllerFactory
  extends ControllerFactory<LoadLastRankingController> {

  constructor(
    lastRankingLoader: Factory<LastRankingLoader>,
  ) {
    super(() => new LoadLastRankingController(lastRankingLoader.make()));
  }
}
