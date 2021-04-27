import { LastPriceLoader } from '@domain/price/usecases';

import { Params } from '@gateway/presentation/contracts';
import { LoadLastPriceController } from '@gateway/presentation/controllers';
import { fakePrice, fakeTicker } from '@mock/price';
import { company } from 'faker';

let workingController: LoadLastPriceController;
let brokenController: LoadLastPriceController;
let params: Params;
let view: object;

describe('Load last price controller', () => {
  beforeAll(() => {
    const ticker = fakeTicker();
    const entity = {
      ticker,
      name: company.companyName(),
      ...fakePrice(),
    };
    view = {
      ...entity,
      date: entity.date.toISOString(),
    };
    const workingLoader = (t: string) => t === ticker ? [entity] : [];
    const workingUseCase = new LastPriceLoader([workingLoader]);
    workingController = new LoadLastPriceController(workingUseCase);
    const brokenLoader = () => {throw new Error();};
    const brokenUseCase = new LastPriceLoader([brokenLoader]);
    brokenController = new LoadLastPriceController(brokenUseCase);
    params = { ticker };
  });

  it('should be able to obtain price data', async done => {
    await expect(
      workingController.handle(params)
    ).resolves.toEqual({statusCode: 200, data: view});
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

  it('should be able to report error when asset not found', async done => {
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    await expect(
      workingController.handle({ticker: fakeTicker()})
    ).resolves.toEqual(expect.objectContaining({
      statusCode: 404,
      data: {
        message: expect.stringMatching('Asset .* not found'),
      },
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
