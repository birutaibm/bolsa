import { internet, name } from 'faker';

import { Authorization } from '@domain/user/usecases';

import { tokenVerifier } from '@mock/security';

let adminToken: string;
let userToken: string;
let useCase: Authorization;

describe('Authorization', () => {
  beforeAll(() => {
    adminToken = internet.password();
    userToken = internet.password();
    const userName = name.findName();
    useCase = new Authorization(tokenVerifier.with({
      [adminToken]: { id: '', role: 'ADMIN', userName, },
      [userToken]: { id: '', role: 'USER', userName, },
    }));
  });

  it('should be able to deny access without authorization info', () => {
    expect(useCase.checkAdmin()).toBeFalsy();
    expect(useCase.checkUser()).toBeFalsy();
  });

  it('should be able to deny access without token authorization info', () => {
    expect(useCase.checkAdmin("I'm an Admin")).toBeFalsy();
    expect(useCase.checkUser("I'm an Admin")).toBeFalsy();
  });

  it('should be able to deny access with invalid token', () => {
    expect(useCase.checkAdmin('Token Hello')).toBeFalsy();
    expect(useCase.checkUser('Token Hello')).toBeFalsy();
  });

  it('should be able to deny admin access with user token', () => {
    expect(useCase.checkAdmin(`Token ${userToken}`)).toBeFalsy();
  });

  it('should be able to deny user access with admin token', () => {
    expect(useCase.checkUser(`Token ${adminToken}`)).toBeFalsy();
  });

  it('should be able to give admin access with admin token', () => {
    expect(useCase.checkAdmin(`Token ${adminToken}`)).toBeTruthy();
  });

  it('should be able to give user access with user token', () => {
    expect(useCase.checkUser(`Token ${userToken}`)).toBeTruthy();
  });
});
