import { ExternalSymbolRegister } from '@domain/usecases';
import { ExternalSymbolRegisterController } from '@presentation/controllers';
import { ControllerFactory } from '.';

export class ExternalSymbolRegisterControllerFactory extends ControllerFactory<ExternalSymbolRegisterController> {
  constructor(
    makeExternalSymbolRegister: () => ExternalSymbolRegister,
  ) {
    super();
    this.createInstance = () => new ExternalSymbolRegisterController(makeExternalSymbolRegister());
  }
}
