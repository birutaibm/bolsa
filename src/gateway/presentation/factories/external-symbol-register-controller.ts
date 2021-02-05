import { ExternalSymbolRegister } from '@domain/price/usecases';
import { Factory } from '@utils/factory';
import { ExternalSymbolRegisterController } from '@gateway/presentation/controllers';
import { ControllerFactory } from '.';

export class ExternalSymbolRegisterControllerFactory
  extends ControllerFactory<ExternalSymbolRegisterController> {

  constructor(
    externalSymbolRegister: Factory<ExternalSymbolRegister>,
  ) {
    super(() =>
      new ExternalSymbolRegisterController(externalSymbolRegister.make())
    );
  }
}
