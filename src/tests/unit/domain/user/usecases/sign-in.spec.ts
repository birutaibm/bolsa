import { internet, name } from 'faker';

import { InvalidUserPasswordError } from '@errors/invalid-input';

import { UserLoader, SignIn } from '@domain/user/usecases';

import { encoder, tokenCreator, tokenVerifier } from '@mock/security';
import loadPersistedUserDataFromUsername from '@mock/data-adapters/load-persisted-user-data-from-username';

let createToken: (payload: object) => string;
let loader: UserLoader;
let useCase: SignIn;
let password: string;
let user: string;

describe('SignIn', () => {
  beforeAll(async (done) => {
    password = internet.password();
    user = name.findName();
    loader = new UserLoader(
      loadPersistedUserDataFromUsername.withUsers({
        id: '0',
        userName: user,
        role: 'USER',
        passHash: password,
      }), encoder);
    useCase = new SignIn(tokenCreator, loader);
    done();
  });

  it('should be able to signIn with correct credentials', async done => {
    const token = await useCase.signIn(user, password);
    const json = tokenVerifier.compatibleWithCreator().verifyToken(token);
    expect(json).toEqual(expect.objectContaining({userName: user, role: 'USER'}));
    done();
  });

  it('should not be able to signIn with wrong password', async done => {
    await expect(
      useCase.signIn(user, 'wrong password')
    ).rejects.toBeInstanceOf(InvalidUserPasswordError);
    done();
  });

  it('should not be able to signIn with wrong user', async done => {
    await expect(
      useCase.signIn('wrong user', password)
    ).rejects.toBeInstanceOf(InvalidUserPasswordError);
    done();
  });

  it('should repass any unpredicted error, without change it', async done => {
    const error = new Error("I'm an unpredictable error!");
    const useCase = new SignIn({ createToken() {throw error} }, loader);
    await expect(
      useCase.signIn(user, password)
    ).rejects.toBe(error);
    done();
  });
});
