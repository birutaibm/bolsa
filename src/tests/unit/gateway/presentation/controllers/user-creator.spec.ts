import { internet, name } from 'faker';

import { UserCreator } from '@domain/user/usecases';

import { Params } from '@gateway/presentation/contracts';
import { UserCreatorController } from '@gateway/presentation/controllers';

import { encoder } from '@mock/security';

let workingController: UserCreatorController;
let brokenController: UserCreatorController;
let params: Params

describe('User creator controller', () => {
  beforeAll(() => {
    const workingWorker = () => ({ id: 'id', });
    const workingUseCase = new UserCreator(workingWorker, encoder);
    workingController = new UserCreatorController(workingUseCase);
    const brokenWorker = () => {throw new Error();};
    const brokenUseCase = new UserCreator(brokenWorker, encoder);
    brokenController = new UserCreatorController(brokenUseCase);
    params = {
      userName: name.findName(),
      password: internet.password(),
    };
  });

  it('should be able to create user', async done => {
    await expect(
      workingController.handle(params)
    ).resolves.toEqual({statusCode: 201, data: expect.objectContaining({
      userName: params.userName,
      role: 'USER'
    })});
    done();
  });

  it('should be able to create admin', async done => {
    await expect(
      workingController.handle({...params, role: 'ADMIN'})
    ).resolves.toEqual({statusCode: 201, data: expect.objectContaining({
      userName: params.userName,
      role: 'ADMIN'
    })});
    done();
  });

  it('should be able to repass error', async done => {
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    await expect(
      brokenController.handle(params)
    ).resolves.toEqual(expect.objectContaining({statusCode: 500}));
    done();
  });

  it('should be able to report wrong parameters', async done => {
    await expect(
      workingController.handle({})
    ).resolves.toEqual(expect.objectContaining({
      statusCode: 400,
      data: { message: 'Required parameters: userName, password' }
    }));
    done();
  });
});
