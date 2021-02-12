import { SymbolDictionaryEntry } from '@domain/price/entities';
import { ExternalSymbolRegister } from '@domain/price/usecases/external-symbol-register';
import { InvalidSymbolDictionaryEntryError } from '@errors/invalid-symbol-dictionary-entry';

const reqFunValues = {
  banks: ['ITUB3.SAO', 'BBAS3.SAO'],
  commodities: ['PETR4.SAO', 'VALE4.SAO'],
};
let symbolRegister: ExternalSymbolRegister;

describe('ExternalSymbolRegister', () => {
  beforeAll(() => {
    const reqFun = {
      getKnownSources: () => Object.keys(reqFunValues),
      getWorker: (source: string) => {
        if (!reqFunValues[source])
          throw new Error();
        return {
          getValidSymbols: async () => reqFunValues[source],
          register: async (info: SymbolDictionaryEntry) => info,
        };
      },
    };
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
      source: 'banks',
      externalSymbol: 'ITUB3.SAO',
      ticker: 'ITUB3',
    };
    await expect(
      symbolRegister.registry(info)
    ).resolves.toEqual(info);
    done();
  });

  it('should not be able to registry an entry with invalid symbol', async (done) => {
    const info: SymbolDictionaryEntry = {
      source: 'banks',
      externalSymbol: 'invalid',
      ticker: 'ITUB3',
    };
    await expect(
      symbolRegister.registry(info)
    ).rejects.toBeInstanceOf(InvalidSymbolDictionaryEntryError)
    done();
  });

  it('should not be able to registry an entry with invalid source', async (done) => {
    const info: SymbolDictionaryEntry = {
      source: 'invalid',
      externalSymbol: 'ITUB3.SAO',
      ticker: 'ITUB3',
    };
    await expect(
      symbolRegister.registry(info)
    ).rejects.toBeInstanceOf(InvalidSymbolDictionaryEntryError)
    done();
  });

  it('should not be able to registry an invalid entry', async (done) => {
    const info: SymbolDictionaryEntry = {
      source: 'commodities',
      externalSymbol: 'ITUB3.SAO',
      ticker: 'PETR4',
    };
    await expect(
      symbolRegister.registry(info)
    ).rejects.toBeInstanceOf(InvalidSymbolDictionaryEntryError)
    done();
  });

  it('should be able to registry a valid dictionary', async (done) => {
    const info = [{
      source: 'banks',
      externalSymbol: 'ITUB3.SAO',
      ticker: 'ITUB3',
    }, {
      source: 'banks',
      externalSymbol: 'BBAS3.SAO',
      ticker: 'BBAS3',
    }, {
      source: 'commodities',
      externalSymbol: 'PETR4.SAO',
      ticker: 'PETR4',
    }];
    await expect(
      symbolRegister.registryAll(info)
    ).resolves.toEqual(info);
    done();
  });

  it('should be able to registry all valid entries of a dictionary', async (done) => {
    const valid = [{
      source: 'banks',
      externalSymbol: 'ITUB3.SAO',
      ticker: 'ITUB3',
    }, {
      source: 'banks',
      externalSymbol: 'BBAS3.SAO',
      ticker: 'BBAS3',
    }, {
      source: 'commodities',
      externalSymbol: 'PETR4.SAO',
      ticker: 'PETR4',
    }];
    const invalid = [{
      source: 'commodities',
      externalSymbol: 'ITUB3.SAO',
      ticker: 'PETR4',
    }];
    await expect(
      symbolRegister.registryAll([...invalid, ...valid])
    ).resolves.toEqual(valid);
    done();
  });
});
