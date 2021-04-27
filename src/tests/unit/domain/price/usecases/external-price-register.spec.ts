import { AssetNotFoundError } from '@errors/not-found';
import { PriceUnavailableError } from '@errors/price-unavailable';
import { NoneExternalSymbolRepository } from '@errors/none-external-symbol-repository';

import { ExternalPriceRegister, RequiredFunctionalities } from '@domain/price/usecases/external-price-register';

import { PriceDTO } from '@gateway/data/dto';

import { create } from '@mock/data-adapters/external-price-register-functionalities';


let ticker: { filled: string; empty: string; unknown: string; inexistent: string; };
let price: PriceDTO;
let func: RequiredFunctionalities;
let useCase: ExternalPriceRegister;

describe('ExternalPriceRegister', () => {
  beforeAll(() => {
    const mock = create();
    ticker = mock.ticker;
    price = mock.price;
    func = mock.functionalities;
    useCase = new ExternalPriceRegister(func);
  });

  it('should be able to registry prices', async (done) => {
    await expect(
      useCase.registry(ticker.filled)
    ).resolves.toEqual([{...price, ticker: ticker.filled, name: ticker.filled}]);
    done();
  });

  it('should not be able to registry prices when there is no external price provider', async (done) => {
    jest.spyOn(func, 'checkThereIsSomeExternal').mockReturnValueOnce(false);
    await expect(
      useCase.registry(ticker.filled)
    ).rejects.toBeInstanceOf(NoneExternalSymbolRepository);
    done();
  });

  it('should throw asset not found when there is no price for ticker', async (done) => {
    await expect(
      useCase.registry(ticker.empty)
    ).rejects.toBeInstanceOf(AssetNotFoundError);
    done();
  });

  it('should throw asset not found when there is no source for ticker', async (done) => {
    await expect(
      useCase.registry(ticker.inexistent)
    ).rejects.toBeInstanceOf(AssetNotFoundError);
    done();
  });

  it('should throw price unavailable when price loader fails', async (done) => {
    await expect(
      useCase.registry(ticker.unknown)
    ).rejects.toBeInstanceOf(PriceUnavailableError);
    done();
  });
});
