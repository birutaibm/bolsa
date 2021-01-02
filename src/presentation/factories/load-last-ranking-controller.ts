import { LastRankingLoader } from '@domain/usecases';
import { LoadLastRankingController } from '@presentation/controllers';
import { ControllerFactory } from '.';

export class LoadLastRankingControllerFactory extends ControllerFactory<LoadLastRankingController> {
  constructor(
    makeLastRankingLoader: () => LastRankingLoader,
  ) {
    super();
    this.createInstance = () => new LoadLastRankingController(makeLastRankingLoader());
  }
}
