import { WalletNotFoundError } from '@errors/not-found';

import { PositionData, PositionRepository, PositionWithWalletData } from '@gateway/data/contracts';

import { positions, wallets } from './wallet-module-data';
import { FakePriceRepository } from './internal-price';

export class FakePositionRepository implements PositionRepository {
  constructor(
    private readonly assets: FakePriceRepository,
  ) {}

  loadPositionsDataByWalletId(id: string): PositionData[] {
    return positions.filter(position => position.walletId === id);
  }

  saveNewPosition(assetId: string, walletId: string): PositionWithWalletData {
    const id = String(positions.length);
    const asset = this.assets.loadAssetDataById(assetId);
    const position: PositionData = { id, asset, walletId, operationIds: [] };
    const wallet = wallets.find(wallet => wallet.id === walletId);
    if (!wallet) {
      throw new WalletNotFoundError(walletId);
    }
    wallet.positionIds.push(id);
    positions.push(position);
    return {...position, wallet};
  }

  loadPositionDataById(id: string): PositionData {
    const index = Number(id);
    return positions[index];
  }

  loadPositionsDataByIds(ids: string[]): PositionData[] {
    return ids.map(this.loadPositionDataById);
  }
}
