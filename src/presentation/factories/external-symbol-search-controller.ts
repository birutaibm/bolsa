import { ExternalSymbolSearch } from '@domain/usecases';
import { ExternalSymbolSearchController } from '@presentation/controllers';
import { ControllerFactory } from '.';

export class ExternalSymbolSearchControllerFactory extends ControllerFactory<ExternalSymbolSearchController> {
  constructor(
    makeExternalSymbolSearch: () => ExternalSymbolSearch,
  ) {
    super();
    this.createInstance = () => new ExternalSymbolSearchController(makeExternalSymbolSearch());
  }
}
