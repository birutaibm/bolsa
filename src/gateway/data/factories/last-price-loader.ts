import {
  LastPriceLoader,
  RequiredFunctionalities
} from '@domain/price/usecases/last-price-loader';
import { ExternalPriceRegister } from '@domain/price/usecases';
import { LoadPriceRepository } from '@gateway/data/contracts';
import { AssetPriceDTO } from '@gateway/data/dto';
import { SingletonFactory } from '@utils/factory';
import { ExternalPriceRegisterFactory } from './external-price-register';

class Functionalities implements RequiredFunctionalities<AssetPriceDTO> {
  public readonly loadFunctions: Array<(ticker: string) => Promise<AssetPriceDTO[]>>;

  constructor(
    loadPriceRepository: LoadPriceRepository,
    externalPriceRegister: ExternalPriceRegister,
  ) {
    this.loadFunctions = [
      (ticker: string) => loadPriceRepository.loadPriceByTicker(ticker),
      (ticker: string) => externalPriceRegister.registry(ticker),
    ];
  }
}

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
