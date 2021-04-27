import { internet, name } from 'faker';

import UserCreator from '@domain/user/usecases/user-creator';

import { encoder } from '@mock/security';

const username = name.findName();
const password = internet.password();
let useCase: UserCreator;

describe('UserCreator', () => {
  beforeAll(() => {
    useCase = new UserCreator(() => ({ id: 'id' }), encoder);
  });

  it('should be able create user from data', async done => {
    const user = await useCase.create(username, password, 'ADMIN');
    expect(user.userName).toEqual(username);
    expect(user.checkPassword(password)).toBeTruthy();
    expect(user.role).toEqual('ADMIN');
    done();
  });

  it('should be able create user with default role as "USER"', async done => {
    const user = await useCase.create(username, password);
    expect(user.userName).toEqual(username);
    expect(user.checkPassword(password)).toBeTruthy();
    expect(user.role).toEqual('USER');
    done();
  });
});
