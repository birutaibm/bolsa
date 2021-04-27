import { datatype, name } from 'faker';

import { InvestorCreator } from '@domain/wallet/usecases';
import { InvestorData } from '@domain/wallet/usecases/dtos';

import WalletModuleSavers from '@mock/data-adapters/wallet-module-savers';

let investorData: InvestorData
let useCase: InvestorCreator;

describe('Investor creator', () => {
  beforeAll(() => {
    investorData = {
      id: datatype.uuid(),
      name: name.findName(),
    };
    const saver = new WalletModuleSavers();
    useCase = new InvestorCreator(saver.newInvestor.bind(saver));
  });

  it('should be able create investor', async done => {
    const investor = await useCase.create(investorData);
    expect(investor.id).toEqual(investorData.id);
    expect(investor.name).toEqual(investorData.name);
    expect(investor.getWallets()).toEqual([]);
    done();
  });
});
