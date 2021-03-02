export type Asset = {
  readonly ticker: string;
  readonly name: string;
};

type Operation = {
  date: Date;
  quantity: number;
  value: number;
};

export default class Position {

  constructor(
    readonly asset: Asset,
    private readonly operations: Operation[] = [],
  ) {}

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
    this.operations.push({ date, quantity, value });
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
    this.operations.push({ date, quantity, value });
    return this;
  }

  getOperations(): Operation[] {
    return [...this.operations];
  }
}
