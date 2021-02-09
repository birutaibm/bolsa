import { promise } from '@utils/promise';

let successPromise: () => Promise<object>;
let failPromise: () => Promise<object>;

describe('promise', () => {
  beforeAll(() => {
    successPromise = () =>
      new Promise((resolve, reject) => resolve({success: true}));
    failPromise = () =>
      new Promise((resolve, reject) => reject({success: false}));
  });

  it('noRejection should not be change return of successfully promise', async (done) => {
    const original = await successPromise();
    const encapsulated = await promise.noRejection(successPromise);
    expect(encapsulated).toEqual(original);
    expect(encapsulated).not.toBe(original);
    done();
  });

  it('noRejection should return default response instead of reject a promise', async (done) => {
    await expect(failPromise()).rejects.toEqual({success: false});
    const encapsulated = await promise.noRejection(failPromise);
    expect(encapsulated).toEqual({});
    done();
  });

  it('all should return resolved and rejected', async (done) => {
    const promises = [failPromise(), successPromise()];
    await expect(promise.all(promises)).resolves.toEqual({
      resolved: [{success: true}],
      rejected: [{success: false}],
    });
    done();
  });
});
