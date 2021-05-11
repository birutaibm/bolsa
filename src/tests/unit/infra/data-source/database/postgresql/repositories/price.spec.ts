import { datatype } from 'faker';

import {
  AssetNotFoundError, ExternalSymbolNotFoundError
} from '@errors/not-found';
import { PriceUnavailableError } from '@errors/price-unavailable';

import { env } from '@infra/environment';
import { PostgreSQL } from '@infra/data-source/database';
import { PostgrePriceRepository } from '@infra/data-source/database/postgresql/repositories/price';

let db: PostgreSQL;
let repo: PostgrePriceRepository;
let ticker: string;

describe('PostgreSQL price repository', () => {
  beforeAll(async done => {
    ticker = 'PRIC3';
    try {
      db = new PostgreSQL(env.postgre);
      const repositories = db.createRepositoryFactories()
      repo = repositories.prices.make();
      done();
    } catch (error) {
      done(error);
    }
  });

  afterEach(async done => {
    try {
      await db.query({
        text: `delete from external_price_symbols;`
      });
      await db.query({
        text: `delete from prices;`
      });
      await db.query({
        text: `delete from assets;`
      });
      done();
    } catch (error) {
      done(error);
    }
  });

  afterAll(async done => {
    try {
      db.disconnect();
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
    const [ { symbol, asset_id: id } ] = await db.query<{
      symbol: string; asset_id: string;
    }>({
      text: `select symbol from external_price_symbols
              inner join assets on asset_id = assets.id
              where assets.ticker = $1 and source = $2`,
      values: [ticker, external.source],
    });
    expect(symbol).toEqual(external.externalSymbol);
    await db.query({text: `DELETE FROM external_price_symbols WHERE asset_id = $1`, values: [id]});
    await db.query({text: `DELETE FROM assets WHERE id = $1`, values: [id]});
    done();
  });

  it('should be able to registry external symbol for existent asset', async done => {
    const [ { id } ] = await db.query<{id: string}>({
      text: `insert into assets(created_on, ticker) values($1, $2) returning id`,
      values: [new Date(), ticker],
    });
    const external = {
      source: 'external source',
      externalSymbol: 'external symbol',
      ticker,
    };
    await expect(
      repo.registryExternalSymbol(external)
    ).resolves.toEqual(expect.objectContaining(external));
    const [ { symbol } ] = await db.query<{symbol: string}>({
      text: `select symbol from external_price_symbols
              where asset_id = $1 and source = $2`,
      values: [id, external.source],
    });
    await db.query({text: `DELETE FROM external_price_symbols WHERE asset_id = $1`, values: [id]});
    await db.query({text: `DELETE FROM assets WHERE id = $1`, values: [id]});
    expect(symbol).toEqual(external.externalSymbol);
    done();
  });

  //getExternalSymbol
  it('should be able to get external symbol', async done => {
    const [ { id } ] = await db.query<{id: string}>({
      text: `insert into assets(created_on, ticker) values($1, $2) returning id`,
      values: [new Date(), ticker],
    });
    await db.query<{}>({
      text: `insert into external_price_symbols(source, symbol, asset_id)
              values($1, $2, $3)`,
      values: ['external source', 'external symbol', id],
    });
    await expect(
      repo.getExternalSymbol(ticker, 'external source')
    ).resolves.toEqual('external symbol');
    await db.query({text: `DELETE FROM external_price_symbols WHERE asset_id = $1`, values: [id]});
    await db.query({text: `DELETE FROM assets WHERE id = $1`, values: [id]});
    done();
  });

  it('should not be able to get inexistent external symbol', async done => {
    const [ { id } ] = await db.query<{id: string}>({
      text: `insert into assets(created_on, ticker) values($1, $2) returning id`,
      values: [new Date(), ticker],
    });
    await expect(
      repo.getExternalSymbol(ticker, 'external source')
    ).rejects.toBeInstanceOf(ExternalSymbolNotFoundError);
    await db.query({text: `DELETE FROM assets WHERE id = $1`, values: [id]});
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
    await db.query({text: `DELETE FROM prices WHERE asset_id = $1`, values: [response[0].id]});
    await db.query({text: `DELETE FROM assets WHERE id = $1`, values: [response[0].id]});
    done();
  });

  it('should be able to save prices at existent asset', async done => {
    const [ { id } ] = await db.query<{id: string}>({
      text: `insert into assets(created_on, ticker) values($1, $2) returning id`,
      values: [new Date(), ticker],
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
    await db.query<{}>({
      text: `DELETE FROM prices WHERE asset_id = $1`,
      values: [id],
    });
    await db.query<{}>({
      text: `DELETE FROM assets WHERE id = $1`,
      values: [id],
    });
    done();
  });

  // //loadPriceByTicker
  it('should be able to get price from ticker', async done => {
    const [ { id } ] = await db.query<{id: string}>({
      text: `insert into assets(created_on, ticker) values($1, $2) returning id`,
      values: [new Date(), ticker],
    });
    await db.query<{}>({
      text: `insert into
             prices(created_on, date, low, high, open, close, asset_id)
             values($1, $2, $3, $4, $5, $6, $7)`,
      values: [new Date(), new Date(), 32.23, 32.23, 32.23, 32.23, id],
    });
    const response = await repo.loadPriceByTicker(ticker);
    expect(response).toBeInstanceOf(Array);
    expect(response.length).toBeGreaterThan(0);
    expect(response[0].ticker).toEqual(ticker);
    await db.query<{}>({
      text: `DELETE FROM prices WHERE asset_id = $1`,
      values: [id],
    });
    await db.query<{}>({
      text: `DELETE FROM assets WHERE id = $1`,
      values: [id],
    });
    done();
  });

  it('should not be able to get inexistent price from ticker', async done => {
    await expect(
      repo.loadPriceByTicker('ticker')
    ).rejects.toBeInstanceOf(AssetNotFoundError);
    done();
  });

  it('should be able to encapsulate any db error at PriceUnavailableError', async done => {
    jest.spyOn(db, 'query').mockImplementationOnce(() => {
      throw new Error("");
    });
    await expect(
      repo.loadPriceByTicker(ticker)
    ).rejects.toBeInstanceOf(PriceUnavailableError);
    done();
  });

  //loadAssetDataById
  it('should be able to get asset by id', async done => {
    const name = 'Itaú';
    const [ { id } ] = await db.query<{id: string}>({
      text: `insert into assets(created_on, ticker, name) values($1, $2, $3) returning id`,
      values: [new Date(), ticker, name],
    });
    await expect(
      repo.loadAssetDataById(id)
    ).resolves.toEqual(expect.objectContaining({id, ticker, name}));
    await db.query<{}>({
      text: `DELETE FROM assets WHERE id = $1`,
      values: [id],
    });
    done();
  });

  it('should be able to get asset by id without name', async done => {
    const [ { id } ] = await db.query<{id: string}>({
      text: `insert into assets(created_on, ticker) values($1, $2) returning id`,
      values: [new Date(), ticker],
    });
    await expect(
      repo.loadAssetDataById(id)
    ).resolves.toEqual(expect.objectContaining({id, ticker, name: ticker}));
    await db.query<{}>({
      text: `DELETE FROM assets WHERE id = $1`,
      values: [id],
    });
    done();
  });

  it('should not be able to get inexistent asset by id', async done => {
    const inexistentAssetId = datatype.uuid();
    await expect(
      repo.loadAssetDataById(inexistentAssetId)
    ).rejects.toBeInstanceOf(AssetNotFoundError);
    done();
  });
});
