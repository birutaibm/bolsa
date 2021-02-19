import { InternalRepository, ExternalRepository } from '.';

export interface PriceRepositoriesProvider {
  readonly internal: InternalRepository,
  readonly externals: ExternalRepository[],
}
