import { InternalRepository, ExternalRepository } from '.';

export interface PriceRepositoriesProvider {
  getInternal: () => InternalRepository,
  getExternals: () => ExternalRepository[],
}
