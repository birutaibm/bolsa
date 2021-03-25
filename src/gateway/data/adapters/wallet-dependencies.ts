import {
  Persisted, PopulatedWalletData, PopulatedInvestorData,
  OperationData, PopulatedPositionData, WalletData, PositionData, InvestorData, CheckLoggedUserId,
} from '@domain/wallet/usecases/dtos';
import { SignInRequiredError } from '@errors/sign-in-required';
import { InvestorNotFoundError, OperationNotFoundError, PositionNotFoundError, WalletNotFoundError } from '@errors/not-found';
import {
  InvestorDTO,
  InvestorRepository,
  OperationRepository,
  WalletRepository
} from '../contracts';
import { PositionRepository, PositionData as PersistedPositionData } from '../contracts/position-repository';

type Operation = OperationData & { id: string; };
type OperationWithoutPosition = Omit<Operation, 'position'>;

type Position = PositionData & { id: string; };
type PositionWithoutWallet = Omit<Position, 'wallet'>;

type Wallet = WalletData & { id: string; };
type WalletWithoutOwner = Omit<Wallet, 'owner'>;

export default class WalletDependencies {
  constructor(
    private readonly investors: InvestorRepository,
    private readonly wallets: WalletRepository,
    private readonly positions: PositionRepository,
    private readonly operations: OperationRepository,
  ) {}

  async investorLoader(id: string): Promise<PopulatedInvestorData> {
    const investorData = await this.investors.loadInvestorDataById(id);
    const walletsData =
      await this.wallets.loadWalletsDataByIds(investorData.walletIds);
    const { positions, operations} =
      await this.loadPositionsAndOperationsDataByWallets(walletsData);
    return this.addWalletsToInvestor(
      { id: investorData.id, name: investorData.name, },
      walletsData, positions, operations
    );
  }

  async walletLoader(
    id: string, isLogged: CheckLoggedUserId
  ): Promise<Persisted<PopulatedWalletData>> {
    const walletData = await this.wallets.loadWalletDataById(id);
    if (!isLogged(walletData.ownerId)) {
      throw new WalletNotFoundError(id);
    }
    const investor = await this.investors.loadInvestorDataById(walletData.ownerId);
    const positions = await this.positions.loadPositionsDataByIds(
      walletData.positionIds
    );
    const operations = await this.loadOperationsDataByPositions(positions);
    return this.addPositionsToWallet(
      { id, name: walletData.name, owner: investor }, positions, operations
    );
  }

  async positionLoader(id: string, isLogged: CheckLoggedUserId): Promise<Persisted<PopulatedPositionData>> {
    const { asset, walletId, operationIds } = await this.positions
      .loadPositionDataById(id);
    const { name, ownerId } = await this.wallets.loadWalletDataById(walletId);
    if (!isLogged(ownerId)) {
      throw new PositionNotFoundError(id);
    }
    const owner = await this.investors.loadInvestorDataById(ownerId);
    const operationsData = await this.operations
      .loadOperationsDataByIds(operationIds);
    const position = {
      id, asset, wallet: { name, owner },
    };
    return this.addOperationsToPosition(position, operationsData);
  }

  async operationLoader(id: string, isLogged: CheckLoggedUserId): Promise<Persisted<OperationData>> {
    const { date, quantity, value, positionId } = await this.operations
      .loadOperationDataById(id);
    const { asset, walletId } = await this.positions
      .loadPositionDataById(positionId);
    const { name, ownerId } = await this.wallets.loadWalletDataById(walletId);
    if (!isLogged(ownerId)) {
      throw new OperationNotFoundError(id);
    }
    const owner = await this.investors.loadInvestorDataById(ownerId);
    const position = {id: positionId, asset, wallet: { name, owner } };
    const opData = {id, quantity, value, date};
    return Object.assign(opData, {
      position: this.addOperationsToPosition(position, [opData]),
    });
  }

  private async loadPositionsAndOperationsDataByWallets(
    wallets: Array<{id: string, positionIds: string[]}>
  ): Promise<{
    positions: { [walletId: string]: PersistedPositionData[]; };
    operations: { [posId: string]: OperationWithoutPosition[]; };
  }> {
    const ids = wallets
      .map(wallet => wallet.positionIds)
      .reduce((acc, val) => [...acc, ...val], []);
    const positions = await this.positions.loadPositionsDataByIds(ids);
    const map = positions.reduce((map, pos) => {
      map[pos.walletId] = [...(map[pos.walletId] || []), pos];
      return map;
    }, {});
    wallets.forEach(({id}) => map[id] = map[id] || []);
    const operations = await this.loadOperationsDataByPositions(positions);
    return { positions: map, operations, };
  }

  private async loadOperationsDataByPositions(
    positions: Array<{id: string, operationIds: string[]}>
  ): Promise<{ [posId: string]: OperationWithoutPosition[]; }> {
    const ids = positions
      .map(position => position.operationIds)
      .reduce((acc, val) => [...acc, ...val], []);
    const operations = await this.operations.loadOperationsDataByIds(ids);
    const map = operations.reduce((map, op) => {
      map[op.positionId] = [...(map[op.positionId] || []), op];
      return map;
    }, {});
    positions.forEach(({id}) => map[id] = map[id] || []);
    return map;
  }

  private addWalletsToInvestor(
    investor: InvestorData, wallets: WalletWithoutOwner[],
    positions: {[walletId: string]: PositionWithoutWallet[]},
    operations: {[posId: string]: OperationWithoutPosition[]}
  ): PopulatedInvestorData {
    return Object.assign(investor, {
      wallets: wallets.map(wallet => this.addPositionsToWallet(
        Object.assign(wallet, {owner: investor}), positions[wallet.id], operations
      )),
    });
  }

  private addPositionsToWallet(
    wallet: Persisted<WalletData>, positions: PositionWithoutWallet[],
    operations: {[posId: string]: OperationWithoutPosition[]}
  ): Persisted<PopulatedWalletData> {
    return Object.assign(wallet, {
      positions: positions.map(position => this.addOperationsToPosition(
        Object.assign(position, {wallet}), operations[position.id]
      )),
    });
  }

  private addOperationsToPosition(
    position: Persisted<PositionData>, operations: OperationWithoutPosition[]
  ): PopulatedPositionData {
    return Object.assign(position, {
      operations: operations.map(operation =>
        Object.assign(operation, {position})
      ),
    });
  }
}
