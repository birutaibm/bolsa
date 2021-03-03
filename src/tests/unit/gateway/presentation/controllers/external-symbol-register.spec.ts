import { ExternalSymbolRegister } from '@domain/price/usecases';
import { Authorization } from '@domain/user/usecases';
import { InvalidTokenFormatError } from '@errors/invalid-token-format';
import { SymbolDictionaryEntryDTO } from '@gateway/data/dto';
import { ExternalSymbolRegisterController } from '@gateway/presentation/controllers';

let controller: ExternalSymbolRegisterController;
let ticker: string;
let authorization: string;

describe('External symbol register controller', () => {
  beforeAll(() => {
    ticker = 'ticker';
    const reqFunValues = {
      banks: ['ITUB3.SAO', 'BBAS3.SAO'],
      commodities: ['PETR4.SAO', 'VALE4.SAO'],
    };
    const workingLoader = {
      getKnownSources: () => Object.keys(reqFunValues),
      getWorker: (source: string) => {
        if (!reqFunValues[source])
          throw new Error();
        return {
          getValidSymbols: async () => reqFunValues[source],
          register: async (info: SymbolDictionaryEntryDTO) => {
            if (info.source !== source) {
              throw new Error();
            }
            if (!reqFunValues[source].includes(info.externalSymbol)) {
              throw new Error();
            }
            return info;
          },
        };
      },
    };
    const workingUseCase = new ExternalSymbolRegister(workingLoader);
    authorization = 'Token ',
    controller = new ExternalSymbolRegisterController(
      workingUseCase, new Authorization(() => ({ userName: 'anybody', role: 'ADMIN' })),
    );
  });

  it('should be able to registry external symbol', async done => {
    const params = {
      ticker,
      banks: 'ITUB3.SAO',
      authorization,
    };
    const result = [{source: 'banks', ticker, externalSymbol: 'ITUB3.SAO'}];
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 201, data: result});
    done();
  });

  it('should be able to recognize empty result', async done => {
    const params = {
      ticker,
      source: 'ITUB3.SAO',
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
      banks: 'ITUB3.SAO',
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
      banks: 'ITUB3.SAO',
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
      commodities: 'ITUB3.SAO',
      authorization,
    };
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    await expect(
      controller.handle(params)
    ).resolves.toEqual(expect.objectContaining({statusCode: 500}));
    done();
  });
});
