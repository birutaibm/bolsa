import { LastPriceLoader } from '@domain/price/usecases';
import { Factory } from '@utils/factory';
import { LoadLastPriceController } from '@gateway/presentation/controllers';
import { ControllerFactory } from '.';

export class LoadLastPriceControllerFactory
  extends ControllerFactory<LoadLastPriceController> {

  constructor(
    lastPriceLoader: Factory<LastPriceLoader>,
  ) {
    super(() => new LoadLastPriceController(lastPriceLoader.make()));
  }
}
