import { SearchExternalSymbolRepository } from '@gateway/data/contracts';
import {
  ExternalSymbolSearchFunctionalities as Functionalities
} from '@gateway/data/adapters';
import {
  ExternalSymbolSearch,
} from '@domain/price/usecases/external-symbol-search';
import { SingletonFactory } from '@utils/factory';

export class ExternalSymbolSearchFactory extends SingletonFactory<ExternalSymbolSearch> {
  constructor(
    ...repositories: SearchExternalSymbolRepository[]
  ) {
    super(
      () => new ExternalSymbolSearch(new Functionalities(repositories))
    );
  }
}
