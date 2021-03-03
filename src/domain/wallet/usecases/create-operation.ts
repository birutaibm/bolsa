import Position from '@domain/wallet/entities/position';
import Wallet from '@domain/wallet/entities/wallet';
import { WalletNotFoundError } from '@errors/wallet-not-found';

type AssetData = {
  ticker: string;
  name: string;
};

type OperationData = {
  date: Date;
  quantity: number;
  value: number;
}

type OperationCreationData = {
  wallet: string;
  owner: string;
  asset: AssetData;
  operationType: 'BUY' | 'SELL';
  date?: Date;
  quantity: number;
  value: number;
};

export type WalletData = {
  name: string;
  owner: { name: string };
  positions: Array<{
    asset: AssetData;
    operations: Array<OperationData>
  }>;
};

export type LoadWalletData =
  (walletName: string, ownerName: string) => WalletData | Promise<WalletData>;

export type PersistWalletData =
  (wallet: WalletData) => WalletData | Promise<WalletData>;

export default class CreateOperation {
  constructor(
    private readonly loadWalletData: LoadWalletData,
    private readonly persistWalletData: PersistWalletData,
  ) {}

  async create(
    {
      wallet: walletName, owner, asset, operationType, quantity, value, date
    }: OperationCreationData
  ): Promise<WalletData> {
    let walletData: WalletData;
    try {
      walletData = await this.loadWalletData(walletName, owner);
    } catch (error) {
      if (error instanceof WalletNotFoundError) {
        walletData = { name: walletName, owner: { name: owner }, positions: [] };
      } else
        throw error;
    }
    const positions = walletData.positions.map(positionData => new Position(
      positionData.asset,
      positionData.operations,
    ));
    let position =
      positions.find(position => position.asset.ticker === asset.ticker);
    if (!position) {
      position = new Position(asset);
      positions.push(position)
    }
    const wallet = new Wallet(
      walletData.name,
      walletData.owner,
      positions,
    );
    if (operationType === 'BUY') position.buy(quantity, value, date);
    else position.sell(quantity, value, date);
    return await this.persistWalletData({
      name: wallet.name,
      owner: wallet.owner,
      positions: wallet.getPositions().map(position => ({
        asset: position.asset,
        operations: position.getOperations(),
      })),
    });
  }
}
