import { SignIn, UserData, UserLoader } from '@domain/user/usecases';
import { Params } from '@gateway/presentation/contracts';
import { SignInController } from '@gateway/presentation/controllers';

let workingController: SignInController;
let brokenController: SignInController;
let params: Params

describe('Sign-in controller', () => {
  beforeAll(() => {
    const encoder = {
      encode: async (plain: string) => plain,
      verify: (plain: string, encoded: string) => plain === encoded,
    }
    const tokenGenerator = {
      createToken: (payload: object) => JSON.stringify(payload)
    }
    const userData: UserData = {
      userName: 'Rafael',
      passHash: '123456',
      role: 'USER'
    };
    const workingWorker = {
      getUserFromUsername: async (userName: string) => ({...userData, userName})
    };
    const workingLoader = new UserLoader(workingWorker, encoder);
    const workingUseCase = new SignIn(tokenGenerator, workingLoader);
    workingController = new SignInController(workingUseCase);
    const brokenWorker = {
      getUserFromUsername: async () => {throw new Error();}
    }
    const brokenLoader = new UserLoader(brokenWorker, encoder);
    const brokenUseCase = new SignIn(tokenGenerator, brokenLoader);
    brokenController = new SignInController(brokenUseCase);
    params = {
      userName: 'Rafael',
      password: '123456',
    };
  });

  it('should be able to obtain token data', async done => {
    const response = await workingController.handle(params);
    expect(response.statusCode).toEqual(201);
    expect(Object.keys(response.data)).toContain('token');
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

  it('should be able to report invalid credentials', async done => {
    await expect(
      workingController.handle({
        userName: 'Rafael',
        password: '654321',
      })
    ).resolves.toEqual(expect.objectContaining({
      statusCode: 401,
      data: { message: 'Invalid user and/or password' }
    }));
    done();
  });
});
