import { createVerifyToken } from '@gateway/data/adapters';
import { InvalidTokenFormatError } from '@errors/invalid-token-format';

let verifyToken: (token: string) => object;
let adminToken: string;
let userToken: string;
let verifyUserToken: (token: string) => { role: 'USER' | 'ADMIN' };

describe('Returned function of createVerifyToken', () => {
  beforeAll(() => {
    const userName = 'myName';
    adminToken = 'admin';
    userToken = 'user';
    verifyToken = (token) => {
      switch (token) {
        case adminToken:
          return { userName, role: 'ADMIN' };
        case userToken:
          return { userName, role: 'USER' };
        default:
          return {};
      }
    };
    verifyUserToken = createVerifyToken({ verifyToken });
  });

  it('should be able to recognize admin token', () => {
    expect(verifyUserToken(adminToken)).toEqual(expect.objectContaining(
      { role: 'ADMIN' }
    ));
  });

  it('should be able to recognize user token', () => {
    expect(verifyUserToken(userToken)).toEqual(expect.objectContaining(
      { role: 'USER' }
    ));
  });

  it('should be able to recognize invalid token', () => {
    expect(
      () => verifyUserToken('invalid')
    ).toThrowError(InvalidTokenFormatError);
  });
});
