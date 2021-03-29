import { LastPriceLoader } from '@domain/price/usecases';

import {
  Controller, Params, Response, ok, clientError,
} from '@gateway/presentation/contracts';
import { PriceEntity, priceTranslator, PriceView } from '@gateway/presentation/view';

export class LoadLastPriceController extends Controller {
  constructor(
    private readonly lastPriceLoader: LastPriceLoader
  ) {
    super();
  }

  protected async tryHandle({ticker}: Params): Promise<Response<PriceView>> {
    if (!ticker) {
      return clientError('Can not find ticker at route');
    }
    const price: PriceEntity = await this.lastPriceLoader.load(ticker);
    const data = priceTranslator.entityToView(price);
    return ok(data);
  }
}
