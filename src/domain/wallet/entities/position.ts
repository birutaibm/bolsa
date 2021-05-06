import { Persisted } from '@utils/types';

import Operation from './operation';
import Wallet from './wallet';

export type Asset = {
  readonly ticker: string;
  readonly name: string;
  readonly lastPrice?: {
    readonly date: Date;
    readonly price: number;
  }
};

export default class Position {
  private readonly operations: Operation[] = [];

  constructor(
    readonly id: string,
    readonly asset: Persisted<Asset>,
    readonly wallet: Persisted<Wallet>,
  ) {
    wallet.addPosition(this);
  }

  addOperation(operation: Operation) {
    this.operations.push(operation);
  }

  // TODO: create use-case
  // buy(quantity: number, value: number, date?: Date) {
  //   if (!date) {
  //     date = new Date();
  //   }
  //   if (quantity < 0) {
  //     quantity = -quantity;
  //   }
  //   if (value > 0) {
  //     value = -value;
  //   }
  //   new Operation(date, quantity, value, this);
  // }

  // TODO: create use-case
  // sell(quantity: number, value: number, date?: Date) {
  //   if (!date) {
  //     date = new Date();
  //   }
  //   if (quantity > 0) {
  //     quantity = -quantity;
  //   }
  //   if (value < 0) {
  //     value = -value;
  //   }
  //   new Operation(date, quantity, value, this);
  // }

  getOperations(): Operation[] {
    return [...this.operations];
  }
}
