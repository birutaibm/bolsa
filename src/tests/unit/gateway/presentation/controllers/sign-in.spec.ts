import { internet, name } from 'faker';

import {
  LoadPersistedUserDataFromUsername, SignIn, UserData, UserLoader
} from '@domain/user/usecases';

import { Params } from '@gateway/presentation/contracts';
import { SignInController } from '@gateway/presentation/controllers';

import { encoder, tokenCreator } from '@mock/security';

let workingController: SignInController;
let brokenController: SignInController;
let params: Params

function controller(worker: LoadPersistedUserDataFromUsername): SignInController {
  const loader = new UserLoader(worker, encoder);
  const useCase = new SignIn(tokenCreator, loader);
  return new SignInController(useCase);
}

describe('Sign-in controller', () => {
  beforeAll(() => {
    const userName = name.findName();
    const pass = internet.password();
    const userData: UserData = { userName, passHash: pass, role: 'USER' };
    workingController = controller(
      (userName: string) => ({...userData, id:'', userName})
    );
    brokenController = controller(() => {throw new Error();});
    params = { userName, password: pass };
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
      workingController.handle({ ...params, password: internet.password() })
    ).resolves.toEqual(expect.objectContaining({
      statusCode: 401,
      data: { message: 'Invalid user and/or password' }
    }));
    done();
  });
});
