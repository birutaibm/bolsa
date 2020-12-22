import { LastPriceLoaderService } from '@data/services';
import { FakePriceRepository } from '@infra/repositories';
import { LoadLastPriceController } from '@presentation/controllers';

export function makeLoadLastPriceController(): LoadLastPriceController {
  const repo = new FakePriceRepository();
  const loader = new LastPriceLoaderService(repo);
  return new LoadLastPriceController(loader);
}
