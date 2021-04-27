import { ExternalSymbolSearch, SearchResult } from '@domain/price/usecases';
import { Params } from '@gateway/presentation/contracts';
import { ExternalSymbolSearchController } from '@gateway/presentation/controllers';
import { datatype } from 'faker';

let workingController: ExternalSymbolSearchController;
let emptyController: ExternalSymbolSearchController;
let brokenController: ExternalSymbolSearchController;
let ticker: string;
let params: Params;
let result: SearchResult;

describe('Load last price controller', () => {
  beforeAll(() => {
    ticker = datatype.string();
    result = {source: {symbol: {}}};
    const workingLoader = {
      checkThereIsSomeExternal: () => true,
      getExternalSymbols: () => [ result ],
    };
    const workingUseCase = new ExternalSymbolSearch(workingLoader);
    workingController = new ExternalSymbolSearchController(workingUseCase);
    const emptyLoader = {
      checkThereIsSomeExternal: () => true,
      getExternalSymbols: () => [],
    };
    const emptyUseCase = new ExternalSymbolSearch(emptyLoader);
    emptyController = new ExternalSymbolSearchController(emptyUseCase);
    const brokenLoader = {
      checkThereIsSomeExternal: () => false,
      getExternalSymbols: () => [],
    };
    const brokenUseCase = new ExternalSymbolSearch(brokenLoader);
    brokenController = new ExternalSymbolSearchController(brokenUseCase);
    params = { ticker };
  });

  it('should be able to obtain search result', async done => {
    await expect(
      workingController.handle(params)
    ).resolves.toEqual({statusCode: 200, data: result});
    done();
  });

  it('should be able to recognize empty result', async done => {
    await expect(
      emptyController.handle(params)
    ).resolves.toEqual({statusCode: 404, data: {
      message: `Ticker ${ticker} was not found in any external repository`
    }});
    done();
  });

  it('should be able to report wrong parameters', async done => {
    await expect(
      workingController.handle({})
    ).resolves.toEqual(expect.objectContaining({
      statusCode: 400,
      data: { message: 'Can not find ticker at route' }
    }));
    done();
  });

  it('should be able to repass error', async done => {
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    await expect(
      brokenController.handle(params)
    ).resolves.toEqual(expect.objectContaining({statusCode: 500}));
    done();
  });
});
