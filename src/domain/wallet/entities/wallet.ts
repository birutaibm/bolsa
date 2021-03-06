import Position from './position';

export type Investor = {
  id: any;
  name: string;
  wallets?: Wallet[];
};

export default class Wallet {
  constructor (
    readonly name: string,
    readonly owner: Investor,
    private readonly positions: Position[] = [],
  ) {}

  addPosition(position: Position): void {
    this.positions.push(position)
  }

  getPositions(): Position[] {
    return [...this.positions];
  }
};
