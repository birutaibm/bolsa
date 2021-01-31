import { LastPriceLoader } from '@domain/usecases';
import { Factory } from '@domain/utils';
import { LoadLastPriceController } from '@presentation/controllers';
import { ControllerFactory } from '.';

export class LoadLastPriceControllerFactory extends ControllerFactory<LoadLastPriceController> {
  constructor(
    lastPriceLoader: Factory<LastPriceLoader>,
  ) {
    super(() => new LoadLastPriceController(lastPriceLoader.make()));
  }
}
