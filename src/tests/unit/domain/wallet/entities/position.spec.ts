import Wallet from '@domain/wallet/entities/wallet';
import Position, { Asset } from '@domain/wallet/entities/position';
import { Investor } from '@domain/wallet/entities';

let asset: Asset;
let wallet: Wallet;

describe('Wallet position', () => {
  beforeAll(() => {
    asset = {
      ticker: 'ITUB3',
      name: 'Itaú Unibanco Holding',
    };
    wallet = new Wallet('My wallet', new Investor('0', 'Rafael Arantes'));
  });

  it('should be able to create empty position', () => {
    const position = new Position(asset, wallet);
    expect(position.asset).toEqual(asset);
    expect(position.getOperations().length).toBe(0);
  });

  it('should be able to buy', () => {
    const position = new Position(asset, wallet);
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
    const position = new Position(asset, wallet);
    position.buy(-100, 2345);
    expect(position.getOperations().length).toBe(1);
    expect(position.getOperations()[0]).toEqual(expect.objectContaining({
      quantity: 100,
      value: -2345,
    }));
    expect(position.getOperations()[0].date).toBeInstanceOf(Date);
  });

  it('should be able to sell', () => {
    const position = new Position(asset, wallet);
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
    const position = new Position(asset, wallet);
    position.sell(100, -2345);
    expect(position.getOperations().length).toBe(1);
    expect(position.getOperations()[0]).toEqual(expect.objectContaining({
      quantity: -100,
      value: 2345,
    }));
    expect(position.getOperations()[0].date).toBeInstanceOf(Date);
  });
});
