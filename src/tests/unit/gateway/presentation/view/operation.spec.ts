import { company, datatype, finance, name } from 'faker';

import { Persisted } from '@utils/types';

import {
  Asset, Investor, Operation, Position, Wallet
} from '@domain/wallet/entities';

import { operationView } from '@gateway/presentation/view/operation';

import { fakeTicker } from '@mock/price';

let id: string;
let walletName: string;
let investorId: string;
let investorName: string;
let owner: Investor;
let asset: Persisted<Asset>;
let position: Persisted<Position>;
let date: Date;
let quantity: number;
let value: number;

describe('Operation view', () => {
  beforeAll(() => {
    id = datatype.number().toString();
    walletName = finance.accountName();
    investorId = datatype.hexaDecimal(24);
    investorName = name.findName();
    owner = new Investor(investorId, investorName);
    asset = {
      id: datatype.hexaDecimal(24),
      ticker: fakeTicker(),
      name: company.companyName()
    };
    const wallet = new Wallet(datatype.number().toString(), walletName, owner);
    position = new Position(datatype.number().toString(), asset, wallet);
    date = new Date();
    quantity = datatype.number();
    value = -1 * Number(finance.amount());
  });

  it('should be able to format operation data', () => {
    const operation = new Operation(id, date, quantity, value, position);
    expect(operationView(operation)).toEqual(expect.objectContaining({
      id, date: date.toISOString(), quantity, value,
      position: expect.objectContaining({
        asset, wallet: expect.objectContaining({
          name: walletName, owner: expect.objectContaining({ name: investorName })
        }),
      }),
    }));
  });
});
