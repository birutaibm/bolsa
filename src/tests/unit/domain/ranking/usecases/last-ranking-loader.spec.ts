import { Ranking } from '@domain/ranking/entities';
import { LastRankingLoader } from '@domain/ranking/usecases/last-ranking-loader';
import { RankingUnavailableError } from '@errors/ranking-unavailable';

let data: Ranking[]
let load: () => Promise<Ranking[]>;
let useCase: LastRankingLoader;
let validDate: Date;
let invalidDate: Date;

describe('Ranking', () => {
  beforeAll(() => {
    validDate = new Date();
    validDate.setHours(21);
    invalidDate = new Date();
    invalidDate.setHours(23);
    data = [{
      player: {
        name: 'Rafael Arantes',
        country: 'Brazil',
      },
      heroes: [{
        name: 'Fee',
        level: 30,
      }, {
        name: 'Connie',
        level: 23,
      }, {
        name: 'Mabyn',
        level: 27,
      }],
      matchDate: new Date(),
      score: 455,
    }];
    load = async (): Promise<Ranking[]> => data;
    useCase = new LastRankingLoader({load});
    jest.useFakeTimers('modern');
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should be able to get ranking when it is allowed', async (done) => {
    jest.setSystemTime(validDate);
    await expect(
      useCase.load()
    ).resolves.toEqual(data);
    done();
  });

  it('should not be able to get ranking when it is not allowed', async (done) => {
    jest.setSystemTime(invalidDate);
    await expect(
      useCase.load()
    ).rejects.toBeInstanceOf(RankingUnavailableError);
    done();
  });
});
