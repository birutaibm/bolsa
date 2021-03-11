import { WalletNotFoundError } from '@errors/wallet-not-found';
import { AssetData } from '@domain/wallet/usecases/dtos';
import { PositionData, PositionRepository, PositionWithWalletData } from '@gateway/data/contracts';

import { positions, wallets } from './wallet-module-data';

export class FakePositionRepository implements PositionRepository {
  saveNewPosition(asset: AssetData, walletId: string): PositionWithWalletData {
    const id = String(positions.length);
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
