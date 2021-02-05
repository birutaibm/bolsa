import {
  SearchExternalSymbolRepository, RegistryExternalSymbolRepository
} from '.';

export type ExternalSymbolRepositories = {
  [source: string]: ExternalSymbolRepository;
};

export type ExternalSymbolRepository = {
  search: SearchExternalSymbolRepository;
  register: RegistryExternalSymbolRepository;
};
