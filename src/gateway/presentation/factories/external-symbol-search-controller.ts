import { ExternalSymbolSearch } from '@domain/price/usecases';
import { Factory } from '@utils/factory';
import { ExternalSymbolSearchController } from '@gateway/presentation/controllers';
import { ControllerFactory } from '.';

export class ExternalSymbolSearchControllerFactory
  extends ControllerFactory<ExternalSymbolSearchController> {

  constructor(
    externalSymbolSearch: Factory<ExternalSymbolSearch>,
  ) {
    super(() =>
      new ExternalSymbolSearchController(externalSymbolSearch.make())
    );
  }
}
