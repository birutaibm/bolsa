import { datatype, company, finance, name, date } from 'faker';

import { Persisted } from '@utils/types';

import {
  PositionData, WalletData, AssetData, InvestorData, PopulatedInvestorData, PopulatedWalletData, PopulatedPositionData, OperationData, CheckLoggedUserId
} from '@domain/wallet/usecases/dtos';
import { InvestorNotFoundError, OperationNotFoundError, PositionNotFoundError, WalletNotFoundError } from '@errors/not-found';
import { SignInRequiredError } from '@errors/sign-in-required';

export default class WalletModuleLoaders {
  readonly operation: Persisted<OperationData>;
  readonly position: Persisted<PositionData>;
  readonly wallet: Persisted<WalletData>;
  readonly asset: Persisted<AssetData>;
  readonly owner: InvestorData;
  readonly invalidInDB: string;

  constructor() {
    this.owner = { id: datatype.hexaDecimal(24), name: name.findName() };
    this.asset = { id: datatype.number().toString(), ticker: datatype.string(5), name: company.companyName() };
    this.wallet = { id: datatype.number().toString(), name: finance.accountName(), owner: this.owner };
    this.position = { id: datatype.number().toString(), wallet: this.wallet, asset: this.asset };
    this.operation = { id: datatype.number().toString(), date: date.recent(), quantity: datatype.number(), value: -1 * Number(finance.amount()), position: this.position };
    this.invalidInDB = 'Invalid value in db rules';
  }

  loadInvestor(id: string): PopulatedInvestorData {
    if (id === this.invalidInDB) {
      throw new Error("");
    } else if (id === this.owner.id) {
      return {
        ...this.owner,
        wallets: [this.loadWallet(this.wallet.id, () => true)],
      };
    }
    throw new InvestorNotFoundError(id);
  }

  loadWallet(id: string, isLogged: CheckLoggedUserId): Persisted<PopulatedWalletData> {
    if (id === this.invalidInDB) {
      throw new Error("");
    } else if (id === this.wallet.id) {
      if (isLogged(this.owner.id)) {
        return {
          ...this.wallet,
          positions: [this.loadPosition(this.position.id, isLogged)],
        };
      };
      throw new SignInRequiredError();
    }
    throw new WalletNotFoundError(id);
  }

  loadPosition(id: string, isLogged: CheckLoggedUserId): Persisted<PopulatedPositionData> {
    if (id === this.invalidInDB) {
      throw new Error("");
    } else if (id === this.position.id) {
      if (isLogged(this.owner.id)) {
        return { ...this.position, operations: [this.operation] };
      };
      throw new SignInRequiredError();
    }
    throw new PositionNotFoundError(id);
  }

  loadOperation(id: string, isLogged: CheckLoggedUserId): Persisted<OperationData> {
    if (id === this.invalidInDB) {
      throw new Error("");
    } else if (id === this.operation.id) {
      if (isLogged(this.owner.id)) {
        return this.operation;
      }
      throw new SignInRequiredError();
    }
    throw new OperationNotFoundError(id);
  }
}
