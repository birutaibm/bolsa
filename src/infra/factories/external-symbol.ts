import { InternalRepository } from "@data/contracts";
import { ExternalPriceRegisterService, ExternalSymbolRegisterService, ExternalSymbolSearchService, LastPriceLoaderService } from "@data/services";
import { Mongo } from "@infra/data-source/database";
import { FakePriceRepository, AlphavantagePriceRepository, MongoPriceRepository } from "@infra/data-source/repositories";

type ServiceFactory<T> = () => T;

export class ExternalSymbolServicesFactory {
  private readonly alphavantage = new AlphavantagePriceRepository();
  private readonly repo: InternalRepository;

  constructor(mongo?: Mongo) {
    this.repo = mongo
      ? new MongoPriceRepository(mongo)
      : new FakePriceRepository();
  }

  makeExternalSymbolSearch(): ServiceFactory<ExternalSymbolSearchService> {
    return () => new ExternalSymbolSearchService(this.alphavantage);
  }

  makeExternalSymbolRegister(): ServiceFactory<ExternalSymbolRegisterService> {
    const repositories = {
      [this.alphavantage.name]: {
        search: this.alphavantage,
        register: this.repo,
      },
    }
    return () => new ExternalSymbolRegisterService(repositories);
  }

  makeLastPriceLoader(): ServiceFactory<LastPriceLoaderService> {
    const alphavantage = new AlphavantagePriceRepository();
    return () => new LastPriceLoaderService(
      this.repo,
      new ExternalPriceRegisterService(this.repo, this.repo, alphavantage),
    );
  }
}
