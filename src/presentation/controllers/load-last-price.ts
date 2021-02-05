import { LastPriceLoader } from '@domain/usecases';
import {
  Controller, Params, Response, ok, clientError, serverError
} from '@presentation/contracts';
import { PriceEntity, priceTranslator, PriceView } from '@presentation/view';

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
      console.log(error);
      return serverError(error);
    }
  }
}
