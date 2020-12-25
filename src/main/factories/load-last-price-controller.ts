import { LastPriceLoaderService } from '@data/services';
import { ExternalPriceRepository } from '@data/utils';
import { FakePriceRepository, LoadAlphavantagePriceRepository } from '@infra/repositories';
import { LoadLastPriceController } from '@presentation/controllers';

export function makeLoadLastPriceController(): LoadLastPriceController {
  const repo = new FakePriceRepository();
  const alphavantage = new LoadAlphavantagePriceRepository();
  const loader = new LastPriceLoaderService(
    repo,
    new ExternalPriceRepository('alphavantage', alphavantage, repo, repo, alphavantage),
  );
  return new LoadLastPriceController(loader);
}
