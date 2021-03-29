import { AssetNotFoundError } from '@errors/not-found';
import { PriceUnavailableError } from '@errors/price-unavailable';
import { ExternalSymbolNotFoundError } from '@errors/external-symbol-not-found';

import { env } from '@infra/environment';
import { Assets } from '@infra/data-source/model';
import { Mongo } from '@infra/data-source/database';
import { MongoPriceRepository } from '@infra/data-source/database/mongo/repositories/price';

let mongo: Mongo;
let repo: MongoPriceRepository;
let ticker: string;

describe('Mongo price repository', () => {
  beforeAll(async done => {
    ticker = 'ITUB3';
    try {
      mongo = new Mongo(env.mongodb);
      const repositories = await mongo.createRepositoryFactories()
      repo = repositories.prices.make();
      done();
    } catch (error) {
      done(error);
    }
  });

  afterEach(async done => {
    try {
      await Assets.deleteMany();
      done();
    } catch (error) {
      done(error);
    }
  });

  afterAll(async done => {
    try {
      mongo.disconnect();
      done();
    } catch (error) {
      done(error);
    }
  });

  // registryExternalSymbol
  it('should be able to registry external symbol', async done => {
    const external = {
      source: 'external source',
      externalSymbol: 'external symbol',
      ticker,
    };
    await expect(
      repo.registryExternalSymbol(external)
    ).resolves.toEqual(expect.objectContaining(external));
    const asset = await Assets.findOne({ ticker });
    expect(asset?.externals.get('external source')).toEqual('external symbol');
    done();
  });

  it('should be able to registry external symbol for existent asset', async done => {
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
    ).resolves.toEqual(expect.objectContaining(external));
    const asset = await Assets.findOne({ ticker });
    expect(asset?.externals.get('external source')).toEqual('external symbol');
    done();
  });

  //getExternalSymbol
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

  it('should not be able to get external symbol of inexistent asset', async done => {
    await expect(
      repo.getExternalSymbol(ticker, 'external source')
    ).rejects.toBeInstanceOf(ExternalSymbolNotFoundError);
    done();
  });

  //save
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

  it('should be able to save prices at existent asset', async done => {
    await Assets.create({
      ticker,
      prices: [],
    });
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

  //loadPriceByTicker
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

  it('should be able to encapsulate any mongo error at PriceUnavailableError', async done => {
    jest.spyOn(Assets, 'findOne').mockImplementationOnce(() => {
      throw new Error("");
    });
    await expect(
      repo.loadPriceByTicker('ticker')
    ).rejects.toBeInstanceOf(PriceUnavailableError);
    done();
  });

  //loadAssetDataById
  it('should be able to get asset by id', async done => {
    const name = 'Itaú';
    const { id } = await Assets.create({
      ticker,
      name,
    });
    await expect(
      repo.loadAssetDataById(id)
    ).resolves.toEqual({id, ticker, name});
    done();
  });

  it('should be able to get asset by id without name', async done => {
    const { id } = await Assets.create({ticker});
    await expect(
      repo.loadAssetDataById(id)
    ).resolves.toEqual({id, ticker, name: ticker});
    done();
  });

  it('should not be able to get inexistent asset by id', async done => {
    const inexistentAssetId = '1234567890abcdef12345678';
    await expect(
      repo.loadAssetDataById(inexistentAssetId)
    ).rejects.toBeInstanceOf(AssetNotFoundError);
    done();
  });
});
