import { NoneExternalSymbolRepository } from '@errors/none-external-symbol-repository';
import { ExternalSymbolRepositoryProvider } from '@gateway/data/adapters';
import { RegistryExternalSymbolRepository, SearchExternalSymbolRepository } from '@gateway/data/contracts';

let searchEmpty: SearchExternalSymbolRepository;
let searchData: SearchExternalSymbolRepository;
let registry: RegistryExternalSymbolRepository;
let searchAll: SearchExternalSymbolRepository[];
let adapter: ExternalSymbolRepositoryProvider;

describe('SearchExternalSymbolRepositories', () => {
  beforeAll(() => {
    searchEmpty = {
      name: 'Empty',
      getExternalSymbols: async () => ({}),
    };
    searchData = {
      name: 'No data',
      getExternalSymbols: async ticker => ({ [ticker]: {} }),
    };
    registry = {
      registryExternalSymbol: async entry => ({...entry, id: entry.ticker}),
    };
    searchAll = [ searchEmpty, searchData ];
    adapter = new ExternalSymbolRepositoryProvider(registry, searchAll);
  });

  it('should be able to obtain sources list', () => {
    const sources = [ 'Empty', 'No data' ];
    expect(adapter.getKnownSources()).toEqual(sources);
  });

  it('should be able to obtain the appropriate bridge pair functions', async done => {
    const sFunction = jest.spyOn(searchEmpty, 'getExternalSymbols');
    const rFunction = jest.spyOn(registry, 'registryExternalSymbol');
    const worker = adapter.getWorker('Empty');
    expect(sFunction).toHaveBeenCalledTimes(0);
    expect(rFunction).toHaveBeenCalledTimes(0);
    await worker.getValidSymbols('ticker');
    expect(sFunction).toHaveBeenCalledTimes(1);
    expect(rFunction).toHaveBeenCalledTimes(0);
    await worker.register({
      source: 'Empty',
      externalSymbol: 'ticker',
      ticker: 'ticker',
    });
    expect(sFunction).toHaveBeenCalledTimes(1);
    expect(rFunction).toHaveBeenCalledTimes(1);
    done();
  });

  it('should not provide worker of unknown source', () => {
    expect(
      () => adapter.getWorker('invalid source')
    ).toThrow(NoneExternalSymbolRepository);
  });
});
