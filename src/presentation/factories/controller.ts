import { Controller } from "@presentation/contracts";

export interface ControllerFactory<T extends Controller<any>> {
  make: () => T
}
