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
  constructor(
    private readonly loadPriceRepository: LoadPriceRepository,
    private readonly externalPriceRegister: ExternalPriceRegister,
  ) {}

  getLoadFunctions(): Array<(ticker: string) => Promise<AssetPriceDTO[]>> {
    return [
      (ticker: string) => this.loadPriceRepository.loadPriceByTicker(ticker),
      (ticker: string) => this.externalPriceRegister.registry(ticker),
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
