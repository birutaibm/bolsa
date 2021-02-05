import { NoneExternalSymbolRepository } from '@domain/errors';
import {
  ExternalSymbolRepositories,
  ExternalSymbolRepository,
} from '@data/contracts';
import {
  ExternalSymbolRegister, RequiredFunctionalities
} from '@domain/usecases/external-symbol-register';
import { SingletonFactory } from '@domain/utils';
import { SymbolDictionaryEntryDTO } from '@data/dto';

type TypeOfMember<T, M extends keyof T> = T[M];

interface Worker {
  register: TypeOfMember<
    TypeOfMember<ExternalSymbolRepository, 'register'>,
    'registryExternalSymbol'
  >;
  getValidSymbols: (ticker: string) => Promise<string[]>;
};

class Functionalities implements RequiredFunctionalities<Worker> {
  constructor(
    private readonly repositories: ExternalSymbolRepositories,
  ) {}

  getInternalWorker(source: string): Worker {
    const repository = this.repositories[source];
    if (!repository) {
      throw new NoneExternalSymbolRepository();
    }
    const register = (entry: SymbolDictionaryEntryDTO) =>
      repository.register.registryExternalSymbol(entry);
    const getValidSymbols = async (ticker: string) =>
      Object.keys(await repository.search.getExternalSymbols(ticker));
    return { register, getValidSymbols };
  }

  getKnownSources(): string[] {
    return Object.keys(this.repositories);
  }
}

export class ExternalSymbolRegisterFactory extends SingletonFactory<ExternalSymbolRegister> {
  constructor(
    repositories: ExternalSymbolRepositories,
  ) {
    super(() => new ExternalSymbolRegister(new Functionalities(repositories)));
  }
}
