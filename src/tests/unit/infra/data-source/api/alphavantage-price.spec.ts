import { env } from '@infra/environment';
import { AlphavantagePriceRepository } from '@infra/data-source/api';

const key = env.externalPrices.alphavantageKey;

describe('Alphavantage price provider', () => {
  it('should be able to find "ITUB3.SAO" symbol for "ITUB3" ticker', async done => {
    const repo = new AlphavantagePriceRepository(key);
    const response = await repo.getExternalSymbols("ITUB3");
    expect(response["ITUB3.SAO"]).toBeInstanceOf(Object);
    done();
  });

  it('should be able to load prices for "ITUB3.SAO" symbol', async done => {
    const repo = new AlphavantagePriceRepository(key);
    const response = await repo.loadPriceBySymbol("ITUB3.SAO");
    expect(response).toBeInstanceOf(Array);
    expect(response.length).toBeGreaterThan(0);
    expect(response[0]).toBeInstanceOf(Object);
    expect(Object.keys(response[0])).toEqual(expect.arrayContaining([
      'date', 'open', 'close', 'min', 'max',
    ]));
    expect(response[0].date).toBeInstanceOf(Date);
    done();
  });
});
