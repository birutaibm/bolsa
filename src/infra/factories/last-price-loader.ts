import { ExternalPriceRegisterService, LastPriceLoaderService } from '@data/services';
import { Mongo } from '@infra/data-source/database';
import { MongoPriceRepository, AlphavantagePriceRepository, FakePriceRepository } from '@infra/data-source/repositories';

export function makeLastPriceLoader(mongo?: Mongo): LastPriceLoaderService {
  const repo = mongo
    ? new MongoPriceRepository(mongo)
    : new FakePriceRepository();
  const alphavantage = new AlphavantagePriceRepository();
  return new LastPriceLoaderService(
    repo,
    new ExternalPriceRegisterService(repo, repo, alphavantage),
  );
}
