import { ExternalRepository, InternalRepository } from "@data/contracts";
import { ExternalPriceRegisterService, ExternalSymbolRegisterService, ExternalSymbolSearchService, LastPriceLoaderService } from "@data/services";
import { Mongo } from "@infra/data-source/database";
import { FakePriceRepository, AlphavantagePriceRepository, MongoPriceRepository } from "@infra/data-source/repositories";

type ServiceFactory<T> = () => T;

export class ExternalSymbolServicesFactory {
  private readonly external: ExternalRepository[] = [
    new AlphavantagePriceRepository()
  ];
  private readonly internal: InternalRepository;

  constructor(mongo?: Mongo) {
    this.internal = mongo
      ? new MongoPriceRepository(mongo)
      : new FakePriceRepository();
  }

  makeExternalSymbolSearch(): ServiceFactory<ExternalSymbolSearchService> {
    return () => new ExternalSymbolSearchService(this.external[0]);
  }

  makeExternalSymbolRegister(): ServiceFactory<ExternalSymbolRegisterService> {
    const repositories = {
      [this.external[0].name]: {
        search: this.external[0],
        register: this.internal,
      },
    }
    return () => new ExternalSymbolRegisterService(repositories);
  }

  makeLastPriceLoader(): ServiceFactory<LastPriceLoaderService> {
    return () => new LastPriceLoaderService(
      this.internal,
      new ExternalPriceRegisterService(this.internal, this.internal, ...this.external),
    );
  }
}
