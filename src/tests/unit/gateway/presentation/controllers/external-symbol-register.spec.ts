import { ExternalSymbolRegister } from '@domain/price/usecases';
import { Authorization } from '@domain/user/usecases';

import { ExternalSymbolRegisterController } from '@gateway/presentation/controllers';
import { ExternalSymbolRegisterFunctionalities } from '@mock/data-adapters/external-symbol-register-functionalities';

const symbol00 = 'ITUB3.SAO';
const source0 = 'banks';
const source1 = 'commodities';
const reqFunValues = {
  [source0]: [symbol00],
  [source1]: [],
};
let controller: ExternalSymbolRegisterController;
let ticker: string;
let authorization: string;

describe('External symbol register controller', () => {
  beforeAll(() => {
    ticker = 'ticker';
    const workingLoader = new ExternalSymbolRegisterFunctionalities(reqFunValues);
    const workingUseCase = new ExternalSymbolRegister(workingLoader);
    authorization = 'Token ',
    controller = new ExternalSymbolRegisterController(
      workingUseCase, new Authorization({verifyToken: () => (
        {id: '', userName: 'anybody', role: 'ADMIN' }
      )}),
    );
  });

  it('should be able to registry external symbol', async done => {
    const params = {
      ticker,
      [source0]: symbol00,
      authorization,
    };
    const expected = [{source: source0, ticker, externalSymbol: symbol00}];
    const response = await controller.handle(params);
    expect(response.statusCode).toEqual(201);
    expect(response.data.length).toEqual(expected.length);
    expect(response.data[0]).toEqual(expect.objectContaining(expected[0]));
    done();
  });

  it('should be able to recognize empty result', async done => {
    const params = {
      ticker,
      source: symbol00,
      authorization,
    };
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 400, data: {
      message: 'Your request has no valid symbol.',
    }});
    done();
  });

  it('should be able to report wrong route parameters', async done => {
    const params = {
      [source0]: symbol00,
      authorization,
    };
    await expect(
      controller.handle(params)
    ).resolves.toEqual(expect.objectContaining({
      statusCode: 400,
      data: { message: 'Can not find ticker at route' }
    }));
    done();
  });

  it('should be able to report wrong authorization', async done => {
    const params = {
      [source0]: symbol00,
    };
    await expect(
      controller.handle(params)
    ).resolves.toEqual(expect.objectContaining({
      statusCode: 401,
      data: { message: 'Admin privilegies required to this action!' }
    }));
    done();
  });

  it('should be able to repass error', async done => {
    const params = {
      ticker,
      [source1]: symbol00,
      authorization,
    };
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    await expect(
      controller.handle(params)
    ).resolves.toEqual(expect.objectContaining({statusCode: 500}));
    done();
  });
});
