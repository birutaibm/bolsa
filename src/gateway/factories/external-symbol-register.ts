import {
  ExternalSymbolRepositories,
} from '@gateway/data/contracts';
import {
  ExternalSymbolRegisterFunctionalities as Functionalities
} from '@gateway/data/adapters';
import {
  ExternalSymbolRegister
} from '@domain/price/usecases/external-symbol-register';
import { SingletonFactory } from '@utils/factory';

export class ExternalSymbolRegisterFactory extends SingletonFactory<ExternalSymbolRegister> {
  constructor(
    repositories: ExternalSymbolRepositories,
  ) {
    super(() => new ExternalSymbolRegister(new Functionalities(repositories)));
  }
}
