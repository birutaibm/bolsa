import {
  RequiredFunctionalities
} from '@domain/price/usecases/last-price-loader';
import { ExternalPriceRegister } from '@domain/price/usecases';
import { LoadPriceRepository } from '@gateway/data/contracts';
import { AssetPriceDTO } from '@gateway/data/dto';

export class LastPriceLoaderFunctionalities implements RequiredFunctionalities<AssetPriceDTO> {
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
