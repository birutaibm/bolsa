import { Controller } from "@presentation/contracts";

export class ControllerFactory<T extends Controller<any>> {
  private instance: T;

  make(): T {
    if (!this.instance) {
      this.instance = this.createInstance();
    }
    return this.instance;
  }

  protected createInstance: () => T
}
