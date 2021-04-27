import { InvalidSymbolDictionaryEntryError } from '@errors/invalid-input';

import { SymbolDictionaryEntry } from '@domain/price/entities';
import { ExternalSymbolRegister } from '@domain/price/usecases/external-symbol-register';

import { ExternalSymbolRegisterFunctionalities } from '@mock/data-adapters/external-symbol-register-functionalities';

const symbol00 = 'ITUB3.SAO';
const symbol01 = 'BBAS3.SAO';
const symbol10 = 'PETR4.SAO';
const ticker00 = 'ITUB3';
const ticker01 = 'BBAS3';
const ticker10 = 'PETR4';
const source0 = 'banks';
const source1 = 'commodities';
const invalid = 'invalid';
const reqFunValues = {
  [source0]: [symbol00, symbol01],
  [source1]: [symbol10],
};
let symbolRegister: ExternalSymbolRegister;

describe('ExternalSymbolRegister', () => {
  beforeAll(() => {
    const reqFun = new ExternalSymbolRegisterFunctionalities(reqFunValues);
    symbolRegister = new ExternalSymbolRegister(reqFun);
  });

  it('should be able to get known sources', async (done) => {
    expect(
      symbolRegister.getKnownSources()
    ).toEqual(Object.keys(reqFunValues));
    done();
  });

  it('should be able to registry a valid entry', async (done) => {
    const info: SymbolDictionaryEntry = {
      source: source0,
      externalSymbol: symbol00,
      ticker: ticker00,
    };
    await expect(
      symbolRegister.registry(info)
    ).resolves.toEqual(expect.objectContaining(info));
    done();
  });

  it('should not be able to registry an entry with invalid symbol', async (done) => {
    const info: SymbolDictionaryEntry = {
      source: source0,
      externalSymbol: invalid,
      ticker: ticker00,
    };
    await expect(
      symbolRegister.registry(info)
    ).rejects.toBeInstanceOf(InvalidSymbolDictionaryEntryError)
    done();
  });

  it('should not be able to registry an entry with invalid source', async (done) => {
    const info: SymbolDictionaryEntry = {
      source: invalid,
      externalSymbol: symbol00,
      ticker: ticker00,
    };
    await expect(
      symbolRegister.registry(info)
    ).rejects.toBeInstanceOf(InvalidSymbolDictionaryEntryError)
    done();
  });

  it('should not be able to registry an invalid entry', async (done) => {
    const info: SymbolDictionaryEntry = {
      source: source1,
      externalSymbol: symbol00,
      ticker: ticker10,
    };
    await expect(
      symbolRegister.registry(info)
    ).rejects.toBeInstanceOf(InvalidSymbolDictionaryEntryError)
    done();
  });

  it('should be able to registry a valid dictionary', async (done) => {
    const info = [{
      source: source0,
      externalSymbol: symbol00,
      ticker: ticker00,
    }, {
      source: source0,
      externalSymbol: symbol01,
      ticker: ticker01,
    }, {
      source: source1,
      externalSymbol: symbol10,
      ticker: ticker10,
    }];
    const response = await symbolRegister.registryAll(info);
    expect(response.length).toEqual(info.length);
    for (let i = 0; i < response.length; i++) {
      expect(response[i]).toEqual(expect.objectContaining(info[i]));
    }
    done();
  });

  it('should be able to registry all valid entries of a dictionary', async (done) => {
    const valid = [{
      source: source0,
      externalSymbol: symbol00,
      ticker: ticker00,
    }, {
      source: source0,
      externalSymbol: symbol01,
      ticker: ticker01,
    }, {
      source: source1,
      externalSymbol: symbol10,
      ticker: ticker10,
    }];
    const invalid = [{
      source: source1,
      externalSymbol: symbol00,
      ticker: ticker10,
    }];
    const response = await symbolRegister.registryAll([...invalid, ...valid]);
    expect(response.length).toEqual(valid.length);
    for (let i = 0; i < response.length; i++) {
      expect(response[i]).toEqual(expect.objectContaining(valid[i]));
    }
    done();
  });
});
