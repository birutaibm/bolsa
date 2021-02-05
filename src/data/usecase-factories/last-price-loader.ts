import {
  LastPriceLoader,
  RequiredFunctionalities
} from '@domain/usecases/last-price-loader';
import { ExternalPriceRegister } from '@domain/usecases';
import { LoadPriceRepository } from '@data/contracts';
import { AssetPriceDTO } from '@data/dto';
import { SingletonFactory } from '@domain/utils';
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
