import { encoder } from '@domain/user/usecases/encoder';

let text: string;
let encoded: string;

describe('Encoder', () => {
  beforeAll(async (done) => {
    text = 'This is my random text';
    encoded = await encoder.encode(text);
    done();
  });

  it('should be able to validate correct text', () => {
    expect(
      encoder.verify(text, encoded)
    ).toBeTruthy()
  });

  it('should not be able to validate incorrect text', () => {
    expect(
      encoder.verify('Oh, no! I forgot my text', encoded)
    ).toBeFalsy()
  });
});
