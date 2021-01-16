import { RegistryExternalSymbolRepository, SearchExternalSymbolRepository } from '@data/contracts';
import { NoneExternalSymbolRepository } from '@data/errors';
import { SymbolDictionaryEntry } from '@domain/entities';
import { InvalidSymbolDictionaryEntryError } from '@domain/errors';
import { ExternalSymbolRegister } from '@domain/usecases';

type ExternalSymbolRepositories = {
  [source: string]: {
    search: SearchExternalSymbolRepository;
    register: RegistryExternalSymbolRepository;
  };
};

export class ExternalSymbolRegisterService implements ExternalSymbolRegister {
  constructor(
    private readonly repositories: ExternalSymbolRepositories,
  ) {}

  async registry(info: SymbolDictionaryEntry): Promise<SymbolDictionaryEntry> {
    const repositories = this.repositories[info.source];
    if (!repositories) {
      throw new NoneExternalSymbolRepository();
    }
    const validSymbols = await repositories.search.getExternalSymbols(info.ticker);
    if (!Object.keys(validSymbols).includes(info.externalSymbol)) {
      throw new InvalidSymbolDictionaryEntryError(info);
    }
    const registered = await repositories.register.registryExternalSymbol(info);
    return registered;
  }

  getKnownSources(): string[] {
    return Object.keys(this.repositories);
  }
}
