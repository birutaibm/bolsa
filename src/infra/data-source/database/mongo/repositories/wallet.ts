import { Types } from 'mongoose';

import { notNull } from '@utils/validators';
import { WalletNotFoundError } from '@errors/wallet-not-found';

import { WalletRepository } from '@gateway/data/contracts';
import { WalletDTO, PositionDTO } from '@gateway/data/dto';

import { Users } from '@infra/data-source/model';
import Wallets, { WalletDocument } from '@infra/data-source/model/wallet';

import { PositionRepository } from './position';

export class MongoWalletRepository implements WalletRepository {
  constructor(
    private readonly positions: PositionRepository,
  ) {}

  async getWalletFromNameAndOwner(wallet: string, owner: string): Promise<WalletDTO> {
    const wallets = await Wallets.find({ name: wallet });
    const users = await Users.find({ name: owner});
    const found = wallets.filter(item =>
      users.map(user => String(user.id)).includes(String(item.owner))
    );
    if (found.length === 0) {
      throw new WalletNotFoundError(wallet);
    }
    return this.modelToDTO(found[0]);
  }

  async save(wallet: WalletDTO): Promise<WalletDTO> {
    let registry: WalletDocument;
    if (wallet.id !== undefined) {
      registry = notNull(await Wallets.findById(wallet.id));
      const positions = PositionRepository.categorize(wallet.positions);
      await this.updatePositions(registry, positions.existents);
      await this.addPositions(positions.nonExistents, registry);
    } else {
      registry = await Wallets.create({name: wallet.name, owner: wallet.owner});
      await this.addPositions(wallet.positions, registry);
    }
    return this.modelToDTO(await registry.save());
  }

  private async modelToDTO(model: WalletDocument): Promise<WalletDTO> {
    const promises = model.positions.map(this.positions.load);
    const owner = notNull(await Users.findById(model.owner))._id;
    return {
      id: model.id,
      name: model.name,
      owner,
      positions: await Promise.all(promises),
    };
  }

  private async addPositions(positions: PositionDTO[], wallet: WalletDocument) {
    const promises = positions.map(async position => {
      const created = await this.positions.create(position, wallet._id);
      return created._id;
    });
    wallet.positions.push(...await Promise.all(promises));
  }

  private async updatePositions(
    wallet: WalletDocument,
    positions: Array<PositionDTO & {id: Types.ObjectId;}>,
  ) {
    const indices = wallet.positions.map(id =>
      positions.findIndex(position => String(position.id) === String(id))
    );
    for (let i = wallet.positions.length - 1; i >= 0; i--) {
      const index = indices[i];
      if (index === -1) {
        wallet.positions.splice(i, 1);
      } else {
        await this.positions.update(positions[index]);
      }
    }
  }
}
