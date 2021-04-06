import { ExternalSymbolNotFoundError } from '@errors/not-found';
import { MultipleErrors } from '@errors/multiple-errors';
import {
  NoneExternalSymbolRepository
} from '@errors/none-external-symbol-repository';

import {
  ExternalSymbolSearch, SearchResult, RequiredFunctionalities
} from '@domain/price/usecases/external-symbol-search';

let ticker: string;
let optimisticResult: SearchResult;
let noExternals: RequiredFunctionalities;
let goodExternals: RequiredFunctionalities;
let badExternals: RequiredFunctionalities;
let mixedExternals: RequiredFunctionalities;

describe('ExternalSymbolSearch', () => {
  beforeAll(() => {
    ticker = 'ITUB4';
    optimisticResult = {
      externalSource: {
        'ITUB4.SAO': {
          name: 'Itaú Unibanco SA',
        },
      },
    };
    const optimisticPromise: Promise<SearchResult> = new Promise(
      (resolve, reject) => resolve(optimisticResult)
    );
    const pessimisticPromise: Promise<SearchResult> = new Promise(
      (resolve, reject) => reject(new ExternalSymbolNotFoundError('externalSource', ticker))
    );
    noExternals = {
      checkThereIsSomeExternal: () => false,
      getExternalSymbols: () => [],
    };
    goodExternals = {
      checkThereIsSomeExternal: () => true,
      getExternalSymbols: () => [optimisticPromise],
    };
    badExternals = {
      checkThereIsSomeExternal: () => true,
      getExternalSymbols: () => [pessimisticPromise],
    };
    mixedExternals = {
      checkThereIsSomeExternal: () => true,
      getExternalSymbols: () => [pessimisticPromise, optimisticPromise],
    };
  });

  it('should fail if there is no external source', async (done) => {
    await expect(
      new ExternalSymbolSearch(noExternals).search(ticker)
    ).rejects.toBeInstanceOf(NoneExternalSymbolRepository);
    done();
  });

  it('should be able to provide SymbolSearch if there is appropriate source', async (done) => {
    await expect(
      new ExternalSymbolSearch(goodExternals).search(ticker)
    ).resolves.toEqual(optimisticResult);
    done();
  });

  it('should fail if all external sources fails', async (done) => {
    await expect(
      new ExternalSymbolSearch(badExternals).search(ticker)
    ).rejects.toBeInstanceOf(MultipleErrors);
    done();
  });

  it('should be able to provide SymbolSearch even with some bad external source', async (done) => {
    await expect(
      new ExternalSymbolSearch(mixedExternals).search(ticker)
    ).resolves.toEqual(optimisticResult);
    done();
  });
});
