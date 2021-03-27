import { PositionNotFoundError } from '@errors/not-found';
import { SignInRequiredError } from '@errors/sign-in-required';
import { Persisted } from '@utils/types';

import { PositionLoader, OperationCreator, PositionCreator, WalletLoader, WalletCreator, InvestorCreator, InvestorLoader } from '@domain/wallet/usecases';
import { PopulatedPositionData } from '@domain/wallet/usecases/dtos';

let asset: { id: string; ticker: string; name: string; };
let opData: { id: string; date: Date; quantity: number; value: number; };
let positionData: Persisted<PopulatedPositionData>
let useCase: OperationCreator;

describe('Operation creator', () => {
  beforeAll(() => {
    asset = { id: 'assetId', ticker: 'ITUB3', name: 'Itaú Unibanco SA' };
    opData = { id: 'operationId', date: new Date(), quantity: 100, value: -2345 };
    const owner = { id: 'myID', name: 'My Name' };
    const wallet = { id: 'walletId', name: 'My Wallet', owner };
    const position = { id: 'positionId', wallet, asset};
    positionData = {
      ...position,
      id: 'positionId',
      operations: [{
        ...opData,
        position,
      }],
    }
    const positionLoader = new PositionLoader((id, isLoggedUserId) => {
      if (id === positionData.id) {
        if (isLoggedUserId(positionData.wallet.owner.id)) return positionData;
        throw new SignInRequiredError();
      }
      throw new PositionNotFoundError(id);
    });
    const positionCreator = new PositionCreator(
      () => 'positionId',
      { loadAssetDataById() {throw new Error('Not implemented');} },
      new WalletLoader(() => {throw new Error('Not implemented');}),
      new WalletCreator(
        () => {throw new Error('Not implemented');},
        new InvestorLoader(() => {throw new Error('Not implemented');}),
        new InvestorCreator(() => {throw new Error('Not implemented');}),
      ),
    );
    useCase = new OperationCreator(
      () => 'operationId',
      positionLoader,
      positionCreator,
    );
  });

  it('should be able create operation', async done => {
    const operation = await useCase.create({
      date: opData.date,
      quantity: opData.quantity,
      value: opData.value,
      positionId: positionData.id,
      isLogged: () => true,
    });
    expect(operation).toEqual(expect.objectContaining(opData));
    done();
  });

  it('should not be able create operation without been logged', async done => {
    await expect(
      useCase.create({
        date: opData.date,
        quantity: opData.quantity,
        value: opData.value,
        positionId: positionData.id,
        isLogged: () => false,
      })
    ).rejects.toBeInstanceOf(SignInRequiredError);
    done();
  });

  it('should not be able create operation for inexistent position', async done => {
    const id = 'nonInvestorId';
    await expect(
      useCase.create({
        date: opData.date,
        quantity: opData.quantity,
        value: opData.value,
        positionId: 'inexistentPosition',
        isLogged: () => true,
      })
    ).rejects.toBeInstanceOf(PositionNotFoundError);
    done();
  });
});
