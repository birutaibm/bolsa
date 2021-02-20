import { env } from '@infra/environment';
import { Mongo } from '@infra/data-source/database';
import { MongoPriceRepository } from '@infra/data-source/repositories/mongo';
import { Assets } from '@infra/data-source/model';
import { UserNotFoundError } from '@errors/user-not-found';
import { AssetNotFoundError } from '@errors/asset-not-found';
import { PriceUnavailableError } from '@errors/price-unavailable';
import { ExternalSymbolNotFoundError } from '@errors/external-symbol-not-found';

let repo: MongoPriceRepository;
let ticker: string;

describe('Mongo price repository', () => {
  beforeAll(async done => {
    ticker = 'ITUB3';
    async function createRepo(): Promise<MongoPriceRepository> {
      try {
        return new MongoPriceRepository(new Mongo(env.mongodb));
      } catch (error) {
        throw error;
      }
    }
    createRepo().then(
      result => {
        repo = result
        done();
      },
      done
    );
  });

  afterEach(async done => {
    try {
      await Assets.deleteMany();
      done();
    } catch (error) {
      done(error);
    }
  });

  it('should be able to registry external symbol', async done => {
    await Assets.create({
      ticker,
      prices: [],
    });
    const external = {
      source: 'external source',
      externalSymbol: 'external symbol',
      ticker,
    };
    await expect(
      repo.registryExternalSymbol(external)
    ).resolves.toEqual(external);
    const asset = await Assets.findOne({ ticker });
    expect(asset?.externals.get('external source')).toEqual('external symbol');
    done();
  });

  it('should be able to get external symbol', async done => {
    const externals = new Map();
    externals.set('external source', 'external symbol');
    await Assets.create({
      ticker,
      prices: [],
      externals,
    });
    await expect(
      repo.getExternalSymbol(ticker, 'external source')
    ).resolves.toEqual('external symbol');
    done();
  });

  it('should be able to save prices', async done => {
    const price = {
      date: new Date(),
      open: 32.23,
      close: 32.23,
      min: 32.23,
      max: 32.23,
    };
    const response = await repo.save(ticker, [price]);
    expect(response).toBeInstanceOf(Array);
    expect(response.length).toBeGreaterThan(0);
    expect(response[0]).toEqual(expect.objectContaining(price));
    done();
  });

  it('should not be able to get inexistent external symbol', async done => {
    const externals = new Map();
    await Assets.create({
      ticker,
      prices: [],
      externals,
    });
    await expect(
      repo.getExternalSymbol(ticker, 'external source')
    ).rejects.toBeInstanceOf(ExternalSymbolNotFoundError);
    done();
  });

  it('should be able to get price from ticker', async done => {
    await Assets.create({
      ticker,
      prices: [{
        date: new Date().getTime(),
        open: 32.23,
        close: 32.23,
        min: 32.23,
        max: 32.23,
      }],
    });
    const response = await repo.loadPriceByTicker(ticker);
    expect(response).toBeInstanceOf(Array);
    expect(response.length).toBeGreaterThan(0);
    expect(response[0].ticker).toEqual(ticker);
    done();
  });

  it('should not be able to get inexistent price from ticker', async done => {
    await expect(
      repo.loadPriceByTicker('ticker')
    ).rejects.toBeInstanceOf(AssetNotFoundError);
    done();
  });

  it('should be able to get encapsulate any mongo error at PriceUnavailableError', async done => {
    jest.spyOn(Assets, 'findOne').mockImplementationOnce(() => {
      throw new Error("");
    });
    await expect(
      repo.loadPriceByTicker('ticker')
    ).rejects.toBeInstanceOf(PriceUnavailableError);
    done();
  });
});
