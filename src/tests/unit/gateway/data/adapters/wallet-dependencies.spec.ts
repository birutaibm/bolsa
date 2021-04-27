import { datatype, date, finance, name } from 'faker';

import {
  InvestorNotFoundError, OperationNotFoundError, PositionNotFoundError,
  WalletNotFoundError
} from '@errors/not-found';

import { WalletDependencies } from '@gateway/data/adapters';
import {
  InvestorCreationData, OperationData, PersistedWalletData,
  PositionWithWalletData
} from '@gateway/data/contracts';

import {
  executor,
  FakeInvestorRepository, FakeOperationRepository, FakePositionRepository,
  FakePriceRepository, FakeWalletRepository
} from '@mock/data-source/repositories';

import {
  investors, wallets, positions, operations
} from '@mock/data-source/repositories/wallet-module-data';
import { Persisted } from '@utils/types';

type Named = { id: string; name: string; };

let investor: Named;
let wallet: Named;
let position: Persisted<{}>;
let operation: { id: string; date: Date; quantity: number; value: number; };
let adapter: WalletDependencies;

describe('Wallet module dependencies adapter', () => {
  beforeAll(async done => {
    operation = {
      id: operations[0].id,
      date: operations[0].date,
      quantity: operations[0].quantity,
      value: operations[0].value,
    };
    let aux: any = positions.find(position => position.id === operations[0].positionId);
    position = { id: aux.id };
    aux = wallets.find(wallet => wallet.id === aux.walletId);
    wallet = { id: aux.id, name: aux.name };
    aux = investors.find(investor => investor.id === aux.ownerId);
    investor = { id: aux.id, name: aux.name };
    adapter = new WalletDependencies(
      new FakeInvestorRepository(),
      new FakeWalletRepository(),
      new FakePositionRepository(new FakePriceRepository()),
      new FakeOperationRepository(),
    );
    done();
  });

  it('should be able to load operation', async done => {
    await expect(
      adapter.operationLoader(operation.id, () => true)
    ).resolves.toEqual(expect.objectContaining(operation));
    done();
  });

  it('should be able to load position', async done => {
    await expect(
      adapter.positionLoader(position.id, () => true)
    ).resolves.toEqual(expect.objectContaining(
      { operations: [ expect.objectContaining(operation) ] }
    ));
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
