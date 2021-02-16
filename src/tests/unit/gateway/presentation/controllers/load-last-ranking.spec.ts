import { LastRankingLoader } from '@domain/ranking/usecases';
import { LoadLastRankingController } from '@gateway/presentation/controllers';

describe('Load last ranking controller', () => {
  it('should be able to obtain ranking data', async done => {
    const common = {
      player: {
        name: 'Rafael',
        country: 'Brasil',
      },
      score: 1,
      heroes: [],
    };
    const entity = {
      ...common,
      matchDate: new Date(),
    };
    const view = {
      ...common,
      matchDate: entity.matchDate.toISOString(),
    };
    const worker = {
      loadLastRanking: async () => [entity]
    }
    const useCase = new LastRankingLoader(worker);
    const controller = new LoadLastRankingController(useCase);
    await expect(
      controller.handle({})
    ).resolves.toEqual({statusCode: 200, data: [view]});
    done();
  });

  it('should be able to repass error', async done => {
    const worker = {
      loadLastRanking: async () => {throw new Error("Not working");}
    }
    const useCase = new LastRankingLoader(worker);
    const controller = new LoadLastRankingController(useCase);
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    await expect(
      controller.handle({})
    ).resolves.toEqual(expect.objectContaining({statusCode: 500}));
    done();
  });
});
