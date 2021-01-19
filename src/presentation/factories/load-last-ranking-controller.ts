import { LastRankingLoader } from '@domain/usecases';
import { Factory } from '@domain/utils';
import { LoadLastRankingController } from '@presentation/controllers';
import { ControllerFactory } from '.';

export class LoadLastRankingControllerFactory extends ControllerFactory<LoadLastRankingController> {
  constructor(
    lastRankingLoader: Factory<LastRankingLoader>,
  ) {
    super();
    this.createInstance = () => new LoadLastRankingController(lastRankingLoader.make());
  }
}
