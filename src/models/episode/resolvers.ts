import { UserInputError } from 'apollo-server-express';
import { performance } from 'perf_hooks';

import { getEpisodeById } from './queries';
import { getSeasonById } from '../season/queries';

export const resolvers = {
  Query: {
    episode: (parent, { id }) => {
      try {
        const t0 = performance.now();
        const episode = getEpisodeById(id);
        const t1 = performance.now();
        console.log('Episode fetch took ' + (t1 - t0) + ' milliseconds.');

        return episode;
      } catch (err) {
        throw new UserInputError(err.message);
      }
    },
  },
  Episode: {
    season: (episode) => getSeasonById(episode.seasonId),
  },
};
