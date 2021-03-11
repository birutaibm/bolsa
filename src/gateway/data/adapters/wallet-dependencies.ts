import {
  MayBePromise, Persisted, PopulatedWalletData, PopulatedInvestorData,
  OperationData, AssetData, PopulatedPositionData, WalletData, PositionData,
  InvestorData as InvestorCreationDTO
} from "@domain/wallet/usecases/dtos";
import { InvestorPersistedData } from "@domain/wallet/usecases/investor-creator";
import { SignInRequiredError } from "@errors/sign-in-required";
import { WalletNotFoundError } from "@errors/wallet-not-found";
import {
  InvestorRepository, InvestorData,
  OperationRepository,
  WalletRepository, WalletData as PersistedWalletData,
} from "../contracts";
import { PositionRepository, PositionData as PersistedPositionData } from "../contracts/position-repository";

export default class WalletDependencies {
  constructor(
    private readonly investors: InvestorRepository,
    private readonly wallets: WalletRepository,
    private readonly positions: PositionRepository,
    private readonly operations: OperationRepository,
  ) {}

  private async populateWalletsData(
    investorData: InvestorData
  ): Promise<PopulatedInvestorData> {
    const walletsData = await this.wallets.loadWalletsDataByIds(investorData.walletIds);
    const positionIds = walletsData
      .map(wallet => wallet.positionIds)
      .reduce((acc, val) => [...acc, ...val], []);
    const positionsData = await this.positions.loadPositionsDataByIds(positionIds);
    const operationIds = positionsData
      .map(position => position.operationIds)
      .reduce((acc, val) => [...acc, ...val], []);
    const operationsData = await this.operations.loadOperationsDataByIds(operationIds);
    const operationsMap: {[posId: string]: OperationData[]} = operationsData.reduce((map, op) => {
      map[op.positionId] = [...(map[op.positionId] || []), op];
      return map;
    }, {});
    const positionsMap: {[wId: string]: PersistedPositionData[]} = positionsData.reduce((map, pos) => {
      map[pos.walletId] = [...(map[pos.walletId] || []), pos];
      return map;
    }, {});
    const owner: PopulatedInvestorData = {
      id: investorData.id,
      name: investorData.name,
      wallets: walletsData.map(w => {
        const wallet: Persisted<PopulatedWalletData> = {
          id: w.id,
          name: w.name,
          owner,
          positions: positionsMap[w.id].map(p => {
            const position: PopulatedPositionData = {
              id: p.id,
              asset: p.asset,
              wallet,
              operations: operationsMap[p.id].map(o => {
                const operation: OperationData = {
                  date: o.date,
                  position,
                  quantity: o.quantity,
                  value: o.value,
                };
                return operation;
              }),
            };
            return position;
          }),
        };
        return wallet;
      }),
    };
    return owner;
  }

  async walletLoader(id: string, loggedUserId: string): Promise<Persisted<PopulatedWalletData>> {
    const investor = await this.investors.loadInvestorDataById(loggedUserId);
    if (!investor.walletIds.includes(id)) {
      throw new WalletNotFoundError(id);
    }
    const walletData = await this.wallets.loadWalletDataById(id);
    const positions = await this.positions.loadPositionsDataByIds(
      walletData.positionIds
    );
    const operations = await this.operations.loadOperationsDataByIds(positions
      .map(position => position.operationIds)
      .reduce((acc, val) => [...acc, ...val], [])
    );
    const operationsMap = operations.reduce((map, op) => {
      map[op.positionId] = [...(map[op.positionId] || []), op];
      return map;
    }, {});
    const wallet: Persisted<PopulatedWalletData> = {
      id,
      name: walletData.name,
      owner: {
        id: investor.id,
        name: investor.name,
      },
      positions: [],
    };
    wallet.positions = positions.map(positionData => {
      const position: PopulatedPositionData = {
        id: positionData.id,
        asset: positionData.asset,
        wallet,
        operations: [],
      };
      position.operations = operationsMap[position.id]
        .map((operation: { date: Date; value: number; quantity: number; }) => ({
          date: new Date(operation.date),
          value: operation.value,
          quantity: operation.quantity,
          position,
        }));
      return position;
    });
    return wallet;
  }

  async walletCreator(
    name: string, investorId: string, loggedUserId: string
  ): Promise<Persisted<WalletData>> {
    if (loggedUserId !== investorId) {
      throw new SignInRequiredError();
    }
    const { id, owner } = await this.wallets.saveNewWallet(name, investorId);
    return { id, name, owner };
  }

  async investorLoader(id: string): Promise<PopulatedInvestorData> {
    const investorData = await this.investors.loadInvestorDataById(id);
    return await this.populateWalletsData(investorData);
  }

  async operationCreator(
    date: Date, quantity: number, value: number, positionId: string, loggedUserId: string
  ): Promise<Persisted<OperationData>> {
    const { walletId, asset } = await this.positions.loadPositionDataById(positionId);
    const { ownerId, name } = await this.wallets.loadWalletDataById(walletId);
    if (loggedUserId !== ownerId) {
      throw new SignInRequiredError();
    }
    const { id } = await this.operations.saveNewOperation({positionId, quantity, value, date: date.getTime()});
    const owner = await this.investors.loadInvestorDataById(ownerId);
    return {
      id, date, quantity, value, position: {
        asset,
        wallet: { name, owner }
      },
    };
  }

  async operationLoader(id: string, loggedUserId: string): Promise<Persisted<OperationData>> {
    const { date, quantity, value, positionId } = await this.operations
      .loadOperationDataById(id);
    const { asset, walletId } = await this.positions
      .loadPositionDataById(positionId);
    const { name, ownerId } = await this.wallets.loadWalletDataById(walletId);
    if (loggedUserId !== ownerId) {
      throw new SignInRequiredError();
    }
    const owner = await this.investors.loadInvestorDataById(ownerId);
    return {
      id, quantity, value, date: new Date(date),
      position: {
        asset, wallet: { name, owner }
      },
    };
  }

  async positionCreator(asset: AssetData, walletId: string, loggedUserId: string): Promise<Persisted<PositionData>> {
    const owner = await this.wallets.loadWalletDataById(walletId);
    if (loggedUserId !== owner.id) {
      throw new SignInRequiredError();
    }
    const { id, wallet } = await this.positions.saveNewPosition(asset, walletId);
    return {id, asset, wallet: { name: wallet.name, owner }};
  }

  async positionLoader(id: string, loggedUserId: string): Promise<Persisted<PopulatedPositionData>> {
    const { asset, walletId, operationIds } = await this.positions
      .loadPositionDataById(id);
    const { name, ownerId } = await this.wallets.loadWalletDataById(walletId);
    if (loggedUserId !== ownerId) {
      throw new SignInRequiredError();
    }
    const owner = await this.investors.loadInvestorDataById(ownerId);
    const operationsData = await this.operations
      .loadOperationsDataByIds(operationIds);
    const position: Persisted<PopulatedPositionData> = {
      id, asset, wallet: { name, owner },
      operations: operationsData.map(({quantity, value, date}) => ({
        position, quantity, value, date: new Date(date),
      })),
    };
    return position;
  }
}
