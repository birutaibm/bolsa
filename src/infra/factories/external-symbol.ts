import { ExternalSymbolRegisterService, ExternalSymbolSearchService } from "@data/services";
import { FakePriceRepository, LoadAlphavantagePriceRepository } from "@infra/data-source/repositories";

type ServiceFactory<T> = () => T;

export class ExternalSymbolServicesFactory {
  private readonly alphavantage = new LoadAlphavantagePriceRepository();

  makeExternalSymbolSearch(): ServiceFactory<ExternalSymbolSearchService> {
    return () => new ExternalSymbolSearchService(this.alphavantage);
  }

  makeExternalSymbolRegister(): ServiceFactory<ExternalSymbolRegisterService> {
    const repositories = {
      [this.alphavantage.name]: {
        search: this.alphavantage,
        register: new FakePriceRepository(),
      },
    }
    return () => new ExternalSymbolRegisterService(repositories);
  }
}
