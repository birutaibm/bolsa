import { ExternalSymbolRegister } from '@domain/usecases';
import { Factory } from '@domain/utils';
import { ExternalSymbolRegisterController } from '@presentation/controllers';
import { ControllerFactory } from '.';

export class ExternalSymbolRegisterControllerFactory extends ControllerFactory<ExternalSymbolRegisterController> {
  constructor(
    externalSymbolRegister: Factory<ExternalSymbolRegister>,
  ) {
    super(() => new ExternalSymbolRegisterController(externalSymbolRegister.make()));
  }
}
