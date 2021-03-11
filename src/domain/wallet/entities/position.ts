import Operation from './operation';
import Wallet from './wallet';

export type Asset = {
  readonly ticker: string;
  readonly name: string;
};

export default class Position {
  constructor(
    readonly asset: Asset,
    readonly wallet: Wallet,
    private readonly operations: Operation[] = [],
  ) {
    wallet.addPosition(this);
  }

  addOperation(operation: Operation) {
    this.operations.push(operation);
  }

  buy(quantity: number, value: number, date?: Date) {
    if (!date) {
      date = new Date();
    }
    if (quantity < 0) {
      quantity = -quantity;
    }
    if (value > 0) {
      value = -value;
    }
    new Operation(date, quantity, value, this);
  }

  sell(quantity: number, value: number, date?: Date) {
    if (!date) {
      date = new Date();
    }
    if (quantity > 0) {
      quantity = -quantity;
    }
    if (value < 0) {
      value = -value;
    }
    new Operation(date, quantity, value, this);
  }

  getOperations(): Operation[] {
    return [...this.operations];
  }
}
