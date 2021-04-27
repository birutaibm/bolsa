import { InvestorNotFoundError } from '@errors/not-found';

import { InvestorLoader } from '@domain/wallet/usecases';
import { PopulatedInvestorData } from '@domain/wallet/usecases/dtos';

import WalletModuleLoaders from '@mock/data-adapters/wallet-module-loaders';

let asset: { id: string; ticker: string; name: string; };
let opData: { id: string; date: Date; quantity: number; value: number; };
let investorData: PopulatedInvestorData
let useCase: InvestorLoader;

describe('Investor loader', () => {
  beforeAll(() => {
    const loader = new WalletModuleLoaders();
    asset = loader.asset;
    const { id, date, quantity, value } = loader.operation;
    opData = { id, date, quantity, value };
    const { owner, wallet, position } = loader;
    investorData = {
      ...owner,
      wallets: [{
        ...wallet,
        positions: [{
          ...position,
          operations: [{
            ...opData,
            position,
          }],
        }],
      }],
    };
    useCase = new InvestorLoader(loader.loadInvestor.bind(loader));
  });

  it('should be able to load investor', async done => {
    const investor = await useCase.load(investorData.id);
    expect(investor.id).toEqual(investorData.id);
    expect(investor.name).toEqual(investorData.name);
    expect(investor.getWallets().length).toEqual(1);
    const wallet = investor.getWallets()[0];
    expect(wallet.name).toEqual(investorData.wallets[0].name);
    expect(wallet.owner.id).toEqual(investor.id);
    expect(wallet.owner.name).toEqual(investor.name);
    const position = wallet.getPositions()[0];
    expect(position.asset).toEqual(expect.objectContaining(asset));
    expect(position.getOperations()[0]).toEqual(expect.objectContaining(opData));
    done();
  });

  it('should not be able to load inexistent investor', async done => {
    await expect(
      useCase.load('invalidID')
    ).rejects.toBeInstanceOf(InvestorNotFoundError);
    done();
  });
});
