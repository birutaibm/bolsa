import { internet, name } from 'faker';

import { UserNotFoundError } from '@errors/not-found';

import UserLoader from '@domain/user/usecases/user-loader';

import { encoder } from '@mock/security';
import loadPersistedUserDataFromUsername from '@mock/data-adapters/load-persisted-user-data-from-username';

let validUserName: string;
let invalidUserName: string;
let useCase: UserLoader;

describe('UserLoader', () => {
  beforeAll(() => {
    validUserName = name.findName();
    invalidUserName = name.findName();
    useCase = new UserLoader(
      loadPersistedUserDataFromUsername.withUsers({
        id: '',
        userName: validUserName,
        role: 'ADMIN',
        passHash: internet.password(),
      }),
      encoder
    );
  });

  it('should be able load existent user', async done => {
    await expect(
      useCase.load(validUserName)
    ).resolves.toBeInstanceOf(Object);
    done();
  });

  it('should not be able load non existent user', async done => {
    await expect(
      useCase.load(invalidUserName)
    ).rejects.toBeInstanceOf(UserNotFoundError);
    done();
  });
});
