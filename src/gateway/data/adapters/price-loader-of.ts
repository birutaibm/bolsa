import {
  LoadFunctions,
} from '@domain/price/usecases/last-price-loader';
import { ExternalPriceRegister } from '@domain/price/usecases';
import { LoadPriceRepository } from '@gateway/data/contracts';
import { AssetPriceDTO } from '@gateway/data/dto';

export function priceLoaderOf(
  loadPriceRepository: LoadPriceRepository,
  externalPriceRegister: ExternalPriceRegister,
): LoadFunctions<AssetPriceDTO> {
  return [
    (ticker: string) => loadPriceRepository.loadPriceByTicker(ticker),
    (ticker: string) => externalPriceRegister.registry(ticker),
  ];
}
