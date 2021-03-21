import { isValidISODate, notNull } from '@utils/validators';

describe('validators', () => {
  beforeAll(() => {
  });

  it('should be recognize valid date', async (done) => {
    const date = new Date();
    const iso = date.toISOString();
    expect(isValidISODate(iso)).toBeTruthy();
    done();
  });

  it('should be recognize invalid date', async (done) => {
    const date = new Date();
    const iso = date.toISOString() + ' some injection';
    expect(isValidISODate(iso)).toBeFalsy();
    done();
  });

  it('should be recognize nonNull values', async (done) => {
    const date = new Date();
    expect(notNull(date)).toEqual(date);
    done();
  });

  it('should be recognize null values', async (done) => {
    expect(() => notNull(null)).toThrow('Unexpected null value');
    done();
  });
});
