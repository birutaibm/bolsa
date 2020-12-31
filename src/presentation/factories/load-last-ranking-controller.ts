import { LastRankingLoader } from '@domain/usecases';
import { LoadLastRankingController } from '@presentation/controllers';
import { ControllerFactory } from '.';

export class LoadLastRankingControllerFactory implements ControllerFactory<LoadLastRankingController> {
  constructor(
    private readonly makeLastRankingLoader: () => LastRankingLoader,
  ) {}

  make(): LoadLastRankingController {
    return new LoadLastRankingController(this.makeLastRankingLoader());
  }
}
