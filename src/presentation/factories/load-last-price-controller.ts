import { LastPriceLoader } from '@domain/usecases';
import { LoadLastPriceController } from '@presentation/controllers';
import { ControllerFactory } from '.';

export class LoadLastPriceControllerFactory extends ControllerFactory<LoadLastPriceController> {
  constructor(
    makeLastPriceLoader: () => LastPriceLoader,
  ) {
    super();
    this.createInstance = () => new LoadLastPriceController(makeLastPriceLoader());
  }
}
