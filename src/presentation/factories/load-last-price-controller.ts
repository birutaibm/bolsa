import { LastPriceLoader } from '@domain/usecases';
import { Controller } from '@presentation/contracts';
import { LoadLastPriceController } from '@presentation/controllers';

export interface ControllerFactory<T extends Controller<any>> {
  make: () => T
}

export class LoadLastPriceControllerFactory implements ControllerFactory<LoadLastPriceController> {
  constructor(
    private readonly makeLastPriceLoader: () => LastPriceLoader,
  ) {}

  make(): LoadLastPriceController {
    return new LoadLastPriceController(this.makeLastPriceLoader());
  }
}
