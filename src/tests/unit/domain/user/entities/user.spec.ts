import faker from 'faker';

import User, { Role } from '@domain/user/entities/user';

let userName: string;
let passHash: string;
let role: Role;
let passVerifier: (plain: string, encoded: string) => boolean;

describe('User', () => {
  beforeAll(() => {
    userName = faker.name.findName();
    passHash = faker.internet.password();
    role = 'ADMIN';
    passVerifier = (plain: string, encoded: string) => plain === encoded;
  });

  it('should be able to validate correct password', async (done) => {
    const user = new User(userName, passHash, role, passVerifier);
    expect(
      user.checkPassword(passHash)
    ).toBeTruthy()
    done();
  });

  it('should not be able to validate incorrect password', async (done) => {
    const user = new User(userName, passHash, role, passVerifier);
    expect(
      user.checkPassword('wrong password')
    ).toBeFalsy()
    done();
  });
});
