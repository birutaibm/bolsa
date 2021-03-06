import { WalletDTO } from '@gateway/data/dto';

export interface WalletRepository {
  getWalletFromNameAndOwner(wallet: string, owner: string): Promise<WalletDTO> | WalletDTO;
  save(wallet: WalletDTO): Promise<WalletDTO> | WalletDTO;
}
