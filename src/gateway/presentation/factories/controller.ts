import { SingletonFactory } from '@utils/factory';
import { Controller } from '@gateway/presentation/contracts';

export class ControllerFactory<T extends Controller> extends SingletonFactory<T> {
  constructor(
    createInstance: () => T,
  ) {
    super(createInstance);
  }
}
