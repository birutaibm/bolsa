import { InternalPriceRepository, ExternalRepository } from '.';

export interface PriceRepositoriesProvider {
  readonly internal: InternalPriceRepository,
  readonly externals: ExternalRepository[],
}
