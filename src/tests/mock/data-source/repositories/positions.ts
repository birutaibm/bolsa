import { Persisted } from '@utils/types';
import {
  InvestorNotFoundError, PositionNotFoundError, WalletNotFoundError
} from '@errors/not-found';

import {
  PositionData, PositionRepository, PositionWithWalletData,
  RepositoryChangeCommand
} from '@gateway/data/contracts';

import { investors, positions, wallets } from './wallet-module-data';
import { FakePriceRepository } from './internal-price';

export class FakePositionRepository implements PositionRepository<void> {
  constructor(
    private readonly assets: FakePriceRepository,
  ) {}

  loadPositionWithWalletAndOwnerById(id: string): Persisted<PositionWithWalletData> {
    const { asset, operationIds, walletId } = this.loadPositionDataById(id);
    const wallet = wallets.find(item => item.id === walletId);
    if (!wallet) {
      throw new WalletNotFoundError(walletId);
    }
    const owner = investors.find(investor => investor.id === wallet.ownerId);
    if (!owner) {
      throw new InvestorNotFoundError(wallet.ownerId);
    }
    return { id, asset, operationIds, wallet:
      { id: wallet.id, name: wallet.name, owner, },
    };
  }

  loadPositionIdsByWalletId(id: string): string[] {
    return positions
      .filter(position => position.walletId === id)
      .map(position => position.id);
  }

  private loadAssetDataById(assetId: string): PositionData['asset'] {
    const assetData = this.assets.loadAssetDataById(assetId)
    const asset: PositionData['asset'] = {
      id: assetData.id,
      name: assetData.name,
      ticker: assetData.ticker,
    };
    const price = assetData.prices.pop();
    if (price) {
      asset.lastPrice = assetData.prices.reduce(
        (acc, value) => acc.date.getTime() > value.date.getTime()
          ? acc : { date: value.date, price: value.close},
        { date: price.date, price: price.close },
      );
    }
    return asset;
  }

  saveNewPosition(
    assetId: string, walletId: string
  ): RepositoryChangeCommand<PositionWithWalletData,void> {
    return () => {
      const id = String(positions.length);
      const asset = this.loadAssetDataById(assetId);
      const position: PositionData = { id, asset, walletId, operationIds: [] };
      const wallet = wallets.find(wallet => wallet.id === walletId);
      if (!wallet) {
        throw new WalletNotFoundError(walletId);
      }
      const owner = investors.find(investor => investor.id === wallet.ownerId);
      if (!owner) {
        throw new InvestorNotFoundError(wallet.ownerId);
      }
      owner.walletIds.push(wallet.id);
      wallet.positionIds.push(id);
      positions.push(position);
      return {...position, wallet: {
        id: wallet.id, name: wallet.name, owner
      }};
    };
  }

  loadPositionDataById(id: string): PositionData {
    const index = Number(id);
    if (Number.isNaN(index)) {
      throw new PositionNotFoundError(id);
    }
    return positions[index];
  }

  loadPositionsDataByIds(ids: string[]): PositionData[] {
    return ids.map(this.loadPositionDataById);
  }
}
