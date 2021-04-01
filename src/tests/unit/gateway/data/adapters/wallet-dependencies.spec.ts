import { InvestorNotFoundError, OperationNotFoundError, PositionNotFoundError, WalletNotFoundError } from '@errors/not-found';
import { SignInRequiredError } from '@errors/sign-in-required';

import { WalletDependencies } from '@gateway/data/adapters';
import { InvestorCreationData, OperationData, PersistedWalletData, PositionWithWalletData } from '@gateway/data/contracts';

import {
  executor,
  FakeInvestorRepository, FakeOperationRepository, FakePositionRepository,
  FakePriceRepository, FakeWalletRepository
} from '@mock/data-source/repositories';

let investor: InvestorCreationData;
let otherInvestor: InvestorCreationData;
let wallet: PersistedWalletData;
let position: PositionWithWalletData;
let opData: { date: Date; quantity: number; value: number; };
let operation: OperationData;
let adapter: WalletDependencies;

describe('Wallet module dependencies adapter', () => {
  beforeAll(async done => {
    investor = { id: 'myId', name: 'My Name'};
    otherInvestor = { id: 'othersId', name: 'Other Name'};
    const investors = new FakeInvestorRepository();
    const wallets = new FakeWalletRepository();
    const positions = new FakePositionRepository(new FakePriceRepository());
    const operations = new FakeOperationRepository();
    await executor.append(investors.saveNewInvestor(investor));
    await executor.append(investors.saveNewInvestor(otherInvestor));
    wallet = await executor.append(wallets.saveNewWallet(
      'My wallet', investor.id
    ));
    position = await executor.append(positions.saveNewPosition('0', wallet.id));
    opData = { date: new Date(), quantity: 100, value: -2345 };
    operation = await executor.append(operations.saveNewOperation(
      {...opData, positionId: position.id}
    ));
    adapter = new WalletDependencies(
      investors,
      wallets,
      positions,
      operations,
    );
    done();
  });

  it('should be able to load operation', async done => {
    await expect(
      adapter.operationLoader(operation.id, () => true)
    ).resolves.toEqual(expect.objectContaining(opData));
    done();
  });

  it('should be able to load position', async done => {
    await expect(
      adapter.positionLoader(position.id, () => true)
    ).resolves.toEqual(expect.objectContaining({operations: [
      expect.objectContaining(opData),
    ]}));
    done();
  });

  it('should be able to load wallet', async done => {
    await expect(
      adapter.walletLoader(wallet.id, () => true)
    ).resolves.toEqual(expect.objectContaining({name: wallet.name}));
    done();
  });

  it('should be able to load investor', async done => {
    const load = await adapter.investorLoader(investor.id);
    expect(load.name).toEqual(investor.name);
    done();
  });

  it('should not be able to load inexistent investor', async done => {
    await expect(
      adapter.investorLoader('inexistentId')
    ).rejects.toBeInstanceOf(InvestorNotFoundError);
    done();
  });

  it('should not be able to load inexistent wallet', async done => {
    await expect(
      adapter.walletLoader('inexistentId', () => true)
    ).rejects.toBeInstanceOf(WalletNotFoundError);
    done();
  });

  it('should not be able to load inexistent position', async done => {
    await expect(
      adapter.positionLoader('inexistentId', () => true)
    ).rejects.toBeInstanceOf(PositionNotFoundError);
    done();
  });

  it('should not be able to load inexistent operation', async done => {
    await expect(
      adapter.operationLoader('inexistentId', () => true)
    ).rejects.toBeInstanceOf(OperationNotFoundError);
    done();
  });

  it('should not be able to load any data of unknown investor', async done => {
    await expect(
      adapter.walletLoader(wallet.id, () => false)
    ).rejects.toBeInstanceOf(WalletNotFoundError);
    await expect(
      adapter.positionLoader(position.id, () => false)
    ).rejects.toBeInstanceOf(PositionNotFoundError);
    await expect(
      adapter.operationLoader(operation.id, () => false)
    ).rejects.toBeInstanceOf(OperationNotFoundError);
    done();
  });
});
