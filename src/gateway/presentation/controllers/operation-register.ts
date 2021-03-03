import { isValidISODate } from '@utils/validators';
import { Authorization } from '@domain/user/usecases';
import CreateOperation from '@domain/wallet/usecases/create-operation';
import {
  Controller, Params, Response, created, clientError, serverError, unauthorized
} from '@gateway/presentation/contracts';

export class OperationRegisterController implements Controller {
  constructor(
    private readonly useCase: CreateOperation,
    private readonly auth: Authorization,
  ) {}

  async handle({ authorization, walletName: wallet, assetName, ticker, operationType, quantity, value, date }: Params): Promise<Response> {
    const owner = this.auth.getUserName(authorization);
    if (!owner) {
      return unauthorized('Login required to this action!');
    }
    if (operationType !== 'BUY' && operationType !== 'SELL') {
      return clientError('Invalid operation type, use "BUY" or "SELL"');
    }
    if (!wallet) {
      return clientError('Wallet name required!');
    }
    if (!quantity || Number.isNaN(Number(quantity))) {
      return clientError('Quantity must be a number!');
    }
    if (!value || Number.isNaN(Number(value))) {
      return clientError('Value must be a number!');
    }
    if (!isValidISODate(date)) {
      return clientError('Date must be a valid date according to ISO-8601 format!');
    }
    if (!ticker) {
      return clientError('Ticker required!');
    }
    if (!assetName) {
      return clientError('Asset name required!');
    }
    try {
      const data = await this.useCase.create({
        wallet,
        owner,
        operationType,
        quantity: Number(quantity),
        value: Number(value),
        date: new Date(date),
        asset: {
          ticker,
          name: assetName,
        }
      });
      return created(data);
    } catch (error) {
      return serverError(error);
    }
  }
}
