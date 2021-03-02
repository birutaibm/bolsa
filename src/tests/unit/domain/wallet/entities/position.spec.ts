import Position, { Asset } from '@domain/wallet/entities/position';

let asset: Asset;

describe('Wallet position', () => {
  beforeAll(() => {
    asset = {
      ticker: 'ITUB3',
      name: 'Itaú Unibanco Holding',
    };
  });

  it('should be able to create empty position', () => {
    const position = new Position(asset);
    expect(position.asset).toEqual(asset);
    expect(position.getOperations().length).toBe(0);
  });

  it('should be able to buy', () => {
    const position = new Position(asset);
    const date = new Date();
    position.buy(100, -2345, date);
    expect(position.getOperations().length).toBe(1);
    expect(position.getOperations()[0]).toEqual(expect.objectContaining({
      quantity: 100,
      value: -2345,
      date,
    }));
  });

  it('should be able to fix values when buy', () => {
    const position = new Position(asset);
    position.buy(-100, 2345);
    expect(position.getOperations().length).toBe(1);
    expect(position.getOperations()[0]).toEqual(expect.objectContaining({
      quantity: 100,
      value: -2345,
    }));
    expect(position.getOperations()[0].date).toBeInstanceOf(Date);
  });

  it('should be able to sell', () => {
    const position = new Position(asset);
    const date = new Date();
    position.sell(-100, 2345, date);
    expect(position.getOperations().length).toBe(1);
    expect(position.getOperations()[0]).toEqual(expect.objectContaining({
      quantity: -100,
      value: 2345,
      date,
    }));
  });

  it('should be able to fix values when sell', () => {
    const position = new Position(asset);
    position.sell(100, -2345);
    expect(position.getOperations().length).toBe(1);
    expect(position.getOperations()[0]).toEqual(expect.objectContaining({
      quantity: -100,
      value: 2345,
    }));
    expect(position.getOperations()[0].date).toBeInstanceOf(Date);
  });
});
