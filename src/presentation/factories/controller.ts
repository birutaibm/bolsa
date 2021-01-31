import { SingletonFactory } from "@domain/utils";
import { Controller } from "@presentation/contracts";

export class ControllerFactory<T extends Controller> extends SingletonFactory<T> {
  constructor(
    createInstance: () => T,
  ) {
    super(createInstance);
  }
}
