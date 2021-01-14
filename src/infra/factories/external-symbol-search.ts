import { ExternalSymbolSearchService } from '@data/services';
import { LoadAlphavantagePriceRepository } from '@infra/data-source/repositories';

export function makeExternalSymbolSearch(): ExternalSymbolSearchService {
  return new ExternalSymbolSearchService(
    new LoadAlphavantagePriceRepository(),
  );
}
