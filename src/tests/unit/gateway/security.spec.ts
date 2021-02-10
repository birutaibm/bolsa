import Security from '@gateway/security';

let text: string;
let encoded: string;
let security: Security;

describe('Security', () => {
  beforeAll(async (done) => {
    text = 'This is my random text';
    security = new Security(10, { // TODO change this object to test jwt
      publicKey: 'publicKey',
      privateKey: 'privateKey',
      options: {}
    });
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
});
