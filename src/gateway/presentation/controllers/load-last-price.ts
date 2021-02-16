import { LastPriceLoader } from '@domain/price/usecases';
import {
  Controller, Params, Response, ok, clientError, serverError, notFoundError
} from '@gateway/presentation/contracts';
import { PriceEntity, priceTranslator, PriceView } from '@gateway/presentation/view';

export class LoadLastPriceController implements Controller {
  constructor(
    private readonly lastPriceLoader: LastPriceLoader
  ) {}

  async handle({route}: Params): Promise<Response<PriceView>> {
    const ticker = route?.ticker;
    if (!ticker) {
      return clientError('Can not find ticker at route');
    }
    try {
      const price: PriceEntity = await this.lastPriceLoader.load(ticker);
      const data = priceTranslator.entityToView(price);
      return ok(data);
    } catch (error) {
      if (error.name === 'AssetNotFoundError') {
        return notFoundError(error.message);
      }
      return serverError(error);
    }
  }
}
