import { SignInRequiredError } from '@errors/sign-in-required';

import {
  OperationCreationData, OperationData, PositionCreationData, PositionData, WalletCreationData
} from '@domain/wallet/usecases/dtos';

import {
  InvestorRepository, OperationRepository, PositionRepository, WalletRepository,
  RepositoryChangeCommandExecutors, RepositoryChangeCommandExecutor,
} from '../contracts';
import { Persisted } from '@utils/types';

type Investor = { id: string; name: string; };
type Wallet = { id: string; name: string; owner: Investor };
type Operation = Promise<Persisted<OperationData>>;

export default function walletModuleSavers(
  executors: RepositoryChangeCommandExecutors,
  investors: InvestorRepository,
  wallets: WalletRepository,
  positions: PositionRepository,
  operations: OperationRepository,
) {

  async function newInvestor(data: Investor): Promise<Investor & {walletIds: []}> {
    console.log('saving investor', data);
    const executor = await executors.singleCommandExecutor();
    try {
      const response = await executor.append(investors.saveNewInvestor(data));
      await executor.execute();
      return {...response, walletIds: []};
    } catch (error) {
      executor.cancel();
      throw error;
    }
  }

  async function newWallet(data: WalletCreationData): Promise<Wallet> {
    const executor = 'investorId' in data
      ? await executors.singleCommandExecutor()
      : await executors.multiCommandExecutor();
    try {
      const wallet = createWallet(data, executor);
      await executor.execute();
      return wallet;
    } catch (error) {
      await executor.cancel();
      throw error;
    }
  }

  async function createWallet(
    { isLogged, ...data }: WalletCreationData,
    executor: RepositoryChangeCommandExecutor,
  ): Promise<Wallet> {
    if (!isLogged('investorId' in data ? data.investorId : data.userId)) {
      throw new SignInRequiredError();
    }
    const owner = 'investorId' in data
      ? await investors.loadInvestorDataById(data.investorId)
      : await executor.append(
        investors.saveNewInvestor({ id: data.userId, name: data.investorName })
      );
    const { id } = await executor.append(
      wallets.saveNewWallet(data.walletName, owner.id)
    );
    return { id, name: data.walletName, owner };
  }

  async function newPosition(data: PositionCreationData): Promise<Persisted<PositionData>> {
    const executor = 'walletId' in data
      ? await executors.singleCommandExecutor()
      : await executors.multiCommandExecutor();
    try {
      const position = await createPosition(data, executor);
      await executor.execute();
      return position;
    } catch (error) {
      await executor.cancel();
      throw error;
    }
  }

  async function createPosition(
    data: PositionCreationData,
    executor: RepositoryChangeCommandExecutor,
  ): Promise<Persisted<PositionData>> {
    let wallet: Wallet;
    if ('walletId' in data) {
      wallet = await wallets.loadWalletWithOwnerById(data.walletId);
      if (!data.isLogged(wallet.owner.id)) {
        throw new SignInRequiredError();
      }
    } else {
      wallet = await createWallet(data, executor);
    }
    const { id, asset } = await executor.append(
      positions.saveNewPosition(data.assetId, wallet.id)
    );
    return { id, asset, wallet };
  }

  async function newOperation(data: OperationCreationData): Operation {
    const executor = 'walletId' in data
      ? await executors.singleCommandExecutor()
      : await executors.multiCommandExecutor();
    try {
      const position = await createOperation(data, executor);
      await executor.execute();
      return position;
    } catch (error) {
      await executor.cancel();
      throw error;
    }
  }

  async function createOperation(
    data: OperationCreationData,
    executor: RepositoryChangeCommandExecutor,
  ): Operation {
    let position: Persisted<PositionData>;
    if ('positionId' in data) {
      position = await positions.loadPositionWithWalletAndOwnerById(data.positionId);
      if (!data.isLogged(position.wallet.owner.id)) {
        throw new SignInRequiredError();
      }
    } else {
      position = await createPosition(data, executor);
    }
    const { id } = await executor.append(operations.saveNewOperation({
      date: data.date,
      quantity: data.quantity,
      value: data.value,
      positionId: position.id,
    }));
    return {
      id, date: data.date, quantity: data.quantity, value: data.value, position,
    };
  }

  return { newInvestor, newWallet, newPosition, newOperation };
}
