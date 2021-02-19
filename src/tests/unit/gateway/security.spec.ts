import { generateKeyPairSync } from 'crypto';

import Security, { JwtConfig } from '@gateway/security';
import { InvalidTokenFormatError } from '@errors/invalid-token-format';

let text: string;
let encoded: string;
let security: Security;
let jwtConfig: JwtConfig;

describe('Security', () => {
  beforeAll(async (done) => {
    const keys = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      }
    });
    text = 'This is my random text';
    jwtConfig = {
      ...keys,
      options: {
        algorithm: 'RS256',
        expiresIn: '1h',
      },
    };
    security = new Security(10, jwtConfig);
    encoded = await security.encode(text);
    done();
  });

  it('should be able to validate correct text', () => {
    expect(
      security.verify(text, encoded)
    ).toBeTruthy()
  });

  it('should not be able to validate incorrect text', () => {
    expect(
      security.verify('Oh, no! I forgot my text', encoded)
    ).toBeFalsy()
  });

  it('should not be able to validate incorrect text', () => {
    expect(
      security.verify('Oh, no! I forgot my text', encoded)
    ).toBeFalsy()
  });

  it('should be able to verify token generated by itself', () => {
    const value = { name: 'This my token information' };
    const token = security.createToken(value);
    expect(
      security.verifyToken(token)
    ).toEqual(expect.objectContaining(value));
  });

  it('should be able to verify token using another security with the same public key', () => {
    const value = { name: 'This my token information'};
    const token = security.createToken(value);
    const clientSecurity = new Security(10, {
      ...jwtConfig,
      privateKey: 'You have no access to this information',
    });
    expect(
      clientSecurity.verifyToken(token)
    ).toEqual(expect.objectContaining(value));
  });

  it('should not be able to verify token using another security with different public key', () => {
    const value = { name: 'This my token information'};
    const token = security.createToken(value);
    const hackerSecurity = new Security(10, {
      ...jwtConfig,
      publicKey: 'You have no access to this information',
    });
    expect(
      () => hackerSecurity.verifyToken(token)
    ).toThrowError(InvalidTokenFormatError);
  });
});