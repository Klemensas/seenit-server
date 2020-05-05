import { UserInputError } from 'apollo-server-express';
import { performance } from 'perf_hooks';

import { Season } from './model';
import { getSeasonById } from './queries';
import { getEpisodesBySeasonId } from '../episode/queries';

export const resolvers = {
  Query: {
    season: (parent, { id }) => {
      try {
        const season = getSeasonById(id);

        return season;
      } catch (err) {
        throw new UserInputError(err.message);
      }
    },
  },
  Season: {
    episodes: async (season: Season) => {
      const t0 = performance.now();
      const seasonEpisodes = await getEpisodesBySeasonId(season.id);
      const t1 = performance.now();
      console.log('Season episodes took ' + (t1 - t0) + ' milliseconds.');

      // return getEpisodesBySeasonId(season.id)
      return seasonEpisodes;
    },
  },
};
