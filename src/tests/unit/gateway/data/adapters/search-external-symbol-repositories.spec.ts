import { SearchExternalSymbolRepositories } from '@gateway/data/adapters';
import { SearchExternalSymbolRepository } from '@gateway/data/contracts';

let repoFail: SearchExternalSymbolRepository;
let repoEmpty: SearchExternalSymbolRepository;
let repoData: SearchExternalSymbolRepository;

describe('SearchExternalSymbolRepositories', () => {
  beforeAll(() => {
    repoFail = {
      name: 'Fail',
      getExternalSymbols: async () => {throw new Error();},
    };
    repoEmpty = {
      name: 'Empty',
      getExternalSymbols: async () => ({}),
    };
    repoData = {
      name: 'No data',
      getExternalSymbols: async ticker => ({ [ticker]: {} }),
    };
  });

  it('should be able confirm existence of repository', () => {
    const repositories = [ repoFail, repoEmpty, repoData ];
    const adapter = new SearchExternalSymbolRepositories(repositories);
    expect(adapter.checkThereIsSomeExternal()).toBeTruthy();
  });

  it('should be able confirm there is of repository', () => {
    const adapter = new SearchExternalSymbolRepositories([]);
    expect(adapter.checkThereIsSomeExternal()).toBeFalsy();
  });

  it('should be able to obtain one promise to each repository', () => {
    const repositories = [ repoFail, repoEmpty, repoData ];
    const adapter = new SearchExternalSymbolRepositories(repositories);
    expect(
      adapter.getExternalSymbols('ticker')
    ).toHaveLength(repositories.length);
  });

  it('should be able to resolve failed repository to empty result', async done => {
    const repositories = [ repoFail, repoEmpty, repoData ];
    const adapter = new SearchExternalSymbolRepositories(repositories);
    await expect(
      Promise.all(adapter.getExternalSymbols('ticker'))
    ).resolves.toEqual([
      { },
      { Empty: {} },
      { 'No data': { ticker: {} } },
    ]);
    done();
  });
});
