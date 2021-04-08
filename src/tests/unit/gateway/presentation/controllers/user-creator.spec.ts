import { UserCreator } from '@domain/user/usecases';
import { Params } from '@gateway/presentation/contracts';
import { UserCreatorController } from '@gateway/presentation/controllers';

let workingController: UserCreatorController;
let brokenController: UserCreatorController;
let params: Params

describe('User creator controller', () => {
  beforeAll(() => {
    const encoder = {
      encode: async (plain: string) => plain,
      verify: (plain: string, encoded: string) => plain === encoded,
    }
    const workingWorker = async () => ({ id: 'id', });
    const workingUseCase = new UserCreator(workingWorker, encoder);
    workingController = new UserCreatorController(workingUseCase);
    const brokenWorker = async () => {throw new Error();};
    const brokenUseCase = new UserCreator(brokenWorker, encoder);
    brokenController = new UserCreatorController(brokenUseCase);
    params = {
      userName: 'Rafael',
      password: '123456',
    };
  });

  it('should be able to create user', async done => {
    await expect(
      workingController.handle(params)
    ).resolves.toEqual({statusCode: 201, data: expect.objectContaining({
      userName: 'Rafael',
      role: 'USER'
    })});
    done();
  });

  it('should be able to create admin', async done => {
    await expect(
      workingController.handle({...params, role: 'ADMIN'})
    ).resolves.toEqual({statusCode: 201, data: expect.objectContaining({
      userName: 'Rafael',
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
