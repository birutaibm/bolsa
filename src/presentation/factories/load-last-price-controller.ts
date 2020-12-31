import { LastPriceLoader } from '@domain/usecases';
import { LoadLastPriceController } from '@presentation/controllers';
import { ControllerFactory } from '.';

export class LoadLastPriceControllerFactory implements ControllerFactory<LoadLastPriceController> {
  constructor(
    private readonly makeLastPriceLoader: () => LastPriceLoader,
  ) {}

  make(): LoadLastPriceController {
    return new LoadLastPriceController(this.makeLastPriceLoader());
  }
}
