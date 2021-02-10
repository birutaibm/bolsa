import {
  ExternalSymbolDictionary,
  LoadExternalPriceRepository,
  SavePricesRepository
} from '@gateway/data/contracts';
import {
  ExternalPriceRegisterFunctionalities as Functionalities
} from '@gateway/data/adapters';

import {
  ExternalPriceRegister
} from '@domain/price/usecases/external-price-register';
import { SingletonFactory } from '@utils/factory';

export class ExternalPriceRegisterFactory extends SingletonFactory<ExternalPriceRegister> {
  constructor(
    writer: SavePricesRepository,
    dictionary: ExternalSymbolDictionary,
    ...externals: LoadExternalPriceRepository[]
  ) {
    super(() => new ExternalPriceRegister(
      new Functionalities(writer, dictionary, ...externals)
    ));
  }
}
