import { LastPriceLoaderService } from '@data/services';
import { ExternalPriceRepository } from '@data/utils';
import { FakePriceRepository, LoadAlphavantagePriceRepository } from '@infra/repositories';

export function makeLastPriceLoader(): LastPriceLoaderService {
  const repo = new FakePriceRepository();
  const alphavantage = new LoadAlphavantagePriceRepository();
  return new LastPriceLoaderService(
    repo,
    new ExternalPriceRepository('alphavantage', alphavantage, repo, repo, alphavantage),
  );
}
