import { datatype, date, finance } from 'faker';

import { PositionNotFoundError } from '@errors/not-found';
import { SignInRequiredError } from '@errors/sign-in-required';
import { Persisted } from '@utils/types';

import { OperationCreator } from '@domain/wallet/usecases';
import { PopulatedPositionData } from '@domain/wallet/usecases/dtos';

import WalletModuleSavers from '@mock/data-adapters/wallet-module-savers';

let asset: { id: string; ticker: string; name: string; };
let opData: { date: Date; quantity: number; value: number; };
let positionData: Persisted<PopulatedPositionData>
let useCase: OperationCreator;

describe('Operation creator', () => {
  beforeAll(() => {
    const saver = new WalletModuleSavers();
    asset = saver.asset;
    opData = { date: date.recent(), quantity: -1 * datatype.number({min: 1}), value: Number(finance.amount()) };
    positionData = {
      ...saver.position,
      operations: [],
    };
    useCase = new OperationCreator(saver.newOperation.bind(saver));
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

  it('should be able create operation and position', async done => {
    await expect(
      useCase.create({
        date: opData.date,
        quantity: opData.quantity,
        value: opData.value,
        assetId: asset.id,
        walletId: positionData.wallet.id,
        isLogged: () => true,
      })
    ).resolves.toEqual(expect.objectContaining({
      quantity: opData.quantity, position: expect.objectContaining({
        asset
      })
    }));
    done();
  });
});
