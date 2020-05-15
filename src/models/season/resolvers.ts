import { UserInputError } from 'apollo-server-express';

import { Season } from './model';
import { getSeasonById, getSeasonsByTvId } from './queries';
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
    seasons: (parent, { itemId }) => getSeasonsByTvId(itemId),
  },
  Season: {
    episodes: async (season: Season) => getEpisodesBySeasonId(season.id),
  },
};
