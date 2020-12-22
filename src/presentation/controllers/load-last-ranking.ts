import { LastRankingLoader } from '@domain/usecases';
import { Controller, ok, Response, serverError } from '@presentation/contracts';
import { Ranking } from '@presentation/view';

export class LoadLastRankingController implements Controller {
  constructor(
    private readonly lastRankingLoader: LastRankingLoader
  ) {}

  async handle(): Promise<Response<Ranking[]>> {
    try {
      const ranking = await this.lastRankingLoader.load();
      const data = Ranking.fromEntities(ranking);
      return ok(data);
    } catch (error) {
      return serverError(error);
    }
  }
}
