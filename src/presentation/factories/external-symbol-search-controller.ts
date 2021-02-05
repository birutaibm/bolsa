import { ExternalSymbolSearch } from '@domain/usecases';
import { Factory } from '@domain/utils';
import { ExternalSymbolSearchController } from '@presentation/controllers';
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
