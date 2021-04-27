import { ExternalPriceRegister } from '@domain/price/usecases';

import { priceLoaderOf } from '@gateway/data/adapters';

describe('priceLoaderOf', () => {
  it('should provide bridge to appropriate functions', async (done) => {
    const loader = {
      loadPriceByTicker: () => [],
    };
    const register = new ExternalPriceRegister({
      checkThereIsSomeExternal: () => true,
      getExternalPrices: () => [],
      putPrices: () => [],
    });
    const f1 = jest.spyOn(loader, 'loadPriceByTicker');
    const f2 = jest.spyOn(register, 'registry');
    const loads = priceLoaderOf(loader, register);
    expect(loads).toHaveLength(2);
    for (const load of loads) {
      try {
        await load('ticker');
      } catch (error) {}
    }
    expect(f1).toHaveBeenCalledTimes(1);
    expect(f2).toHaveBeenCalledTimes(1);
    done();
  });
});
