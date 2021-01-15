import { ExternalSymbolRegisterService } from '@data/services';
import { FakePriceRepository, LoadAlphavantagePriceRepository } from '@infra/data-source/repositories';

export function makeExternalSymbolRegister(): ExternalSymbolRegisterService {
  const alphavantage = new LoadAlphavantagePriceRepository();
  const repositories = {
    [alphavantage.name]: {
      search: alphavantage,
      register: new FakePriceRepository(),
    },
  }
  return new ExternalSymbolRegisterService(repositories);
}
