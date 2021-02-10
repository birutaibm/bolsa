import {
  LastPriceLoader,
} from '@domain/price/usecases/last-price-loader';
import { LoadPriceRepository } from '@gateway/data/contracts';
import {
  LastPriceLoaderFunctionalities as Functionalities
} from '@gateway/data/adapters';
import { SingletonFactory } from '@utils/factory';
import { ExternalPriceRegisterFactory } from './external-price-register';

export class LastPriceLoaderFactory extends SingletonFactory<LastPriceLoader> {
  constructor(
    loadPriceRepository: LoadPriceRepository,
    externalPriceRegister: ExternalPriceRegisterFactory
  ) {
    super(() => new LastPriceLoader(
      new Functionalities(loadPriceRepository, externalPriceRegister.make())
    ));
  }
}
