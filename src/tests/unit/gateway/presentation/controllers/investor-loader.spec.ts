import { Role } from '@domain/user/entities/user';
import { Authorization } from '@domain/user/usecases';
import { InvestorLoader } from '@domain/wallet/usecases';
import { InvestorNotFoundError } from '@errors/not-found';

import { InvestorLoaderController } from '@gateway/presentation/controllers';

let investorId: string;
let loggedUser: { id: string; role: Role; userName: string; };
let authorization: string;
let useCase: InvestorLoader;
let controller: InvestorLoaderController;

describe('Investor loader controller', () => {
  beforeAll(() => {
    authorization = 'Token ',
    investorId = 'myId';
    useCase = new InvestorLoader(id => {
      if (id === 'Invalid id in db rules') {
        throw new Error("");
      } else if (id === investorId) {
        return {id, name: 'My Name', wallets: []};
      }
      throw new InvestorNotFoundError(id);
    });
    loggedUser = { id: investorId, userName: 'anybody', role: 'USER' };
    controller = new InvestorLoaderController(
      useCase,
      new Authorization(() => loggedUser),
    );
  });

  it('should be able to load investor', async done => {
    const params = {
      id: investorId,
      authorization,
    };
    const result = {id: 'myId', name: 'My Name', wallets: []};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 200, data: result});
    done();
  });

  it('should not be able to load investor without authorization', async done => {
    const params = {
      id: investorId,
    };
    const result = {message: 'Login required to this action!'};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 401, data: result});
    done();
  });

  it('should not be able to load investor without data', async done => {
    const params = {
      authorization,
    };
    const result = {message: 'Required parameters: id'};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 400, data: result});
    done();
  });

  it('should not be able to load investor with other user id', async done => {
    const params = {
      id: 'notTheLoggedUserId',
      authorization,
    };
    const result = {message: 'Login required to this action!'};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 401, data: result});
    done();
  });

  it('should not be able to load inexistent investor', async done => {
    loggedUser.id = 'notInvestorUserId';
    const params = {
      id: loggedUser.id,
      authorization,
    };
    const result = {message: `Can't found investor with id ${loggedUser.id}`};
    await expect(
      controller.handle(params)
    ).resolves.toEqual({statusCode: 404, data: result});
    loggedUser.id = investorId;
    done();
  });

  it('should be able to repass unknown server error', async done => {
    loggedUser.id = 'Invalid id in db rules';
    const params = {
      id: loggedUser.id,
      authorization,
    };
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    await expect(
      controller.handle(params)
    ).resolves.toEqual(expect.objectContaining({statusCode: 500}));
    loggedUser.id = investorId;
    done();
  });
});
