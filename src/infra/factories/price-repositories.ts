import { ExternalRepository, InternalRepository, PriceRepositoriesProvider } from "@data/contracts";
import { Mongo } from "@infra/data-source/database";
import { MongoPriceRepository, FakePriceRepository, AlphavantagePriceRepository } from "@infra/data-source/repositories";

export class PriceRepositories implements PriceRepositoriesProvider {
  private readonly internal: InternalRepository;
  private readonly externals: ExternalRepository[];

  constructor(mongo: Mongo | undefined) {
    this.internal = mongo
      ? new MongoPriceRepository(mongo)
      : new FakePriceRepository();
    this.externals = [
      new AlphavantagePriceRepository(),
    ];
  }

  getInternal(): InternalRepository {
    return this.internal;
  }

  getExternals(): ExternalRepository[] {
    return this.externals
  }
}
