import { transaction } from 'objection';

import { AutoTracked } from './model';
import {
  ItemTypes,
  TvItemTypes,
  cursorListResolver,
} from '../../util/watchedItemHelper';
import { getMovieById } from '../movie/queries';
import { getTvById } from '../tv/queries';
import { getSeasonById, getSeason } from '../season/queries';
import { getEpisodeById, getEpisode } from '../episode/queries';
import { getUserById } from '../user/queries';
import { isAuthenticated } from '../../apollo/helperResolvers';
import {
  createAutoTracked,
  getAutoTrackedByIds,
  getPaginatedAutoTracked,
  deleteAutoTracked,
} from './queries';
import { searchContent } from '../queries';
import { createWatchedListGraph } from '../watched/queries';
import { knex } from '../../config';

type AutoTrackedMetaTvData = {
  season?: number;
  episode?: number;
};

type AutoTrackedMeta = {
  provider: string;
  title?: string;
  tvData?: AutoTrackedMetaTvData;
  filename?: string;
  url?: string;
};

async function resolveTvData(tvData: AutoTrackedMetaTvData, tvId: string) {
  if (!tvData.season || !tvData.episode) return null;

  const season = await getSeason({ tvId, season_number: tvData.season });
  if (!season) return null;

  return getEpisode({ episode_number: tvData.episode, seasonId: season.id });
}

const autoTrackedListResolver = cursorListResolver(
  getPaginatedAutoTracked,
  'autoTracked',
);

const resolvers = {
  Query: {
    autoTracked: async (parent, { id }: { id: string }) => {
      const results = await getAutoTrackedByIds([id]);

      return results[0];
    },
    autoTrackedList: (parent, { cursor, ...filters }) =>
      autoTrackedListResolver(filters, cursor),
  },
  Mutation: {
    addAutoTracked: isAuthenticated.createResolver(
      async (parent, { meta, createdAt }, { user }) => {
        const userId = user.id;
        const isTvItem = !!meta.tvData;

        const searchResults = await searchContent(
          meta.title,
          1,
          isTvItem ? ['tv'] : ['tv', 'movie'],
        );
        const searchItem = searchResults[0];
        let episodeData = null;

        if (searchItem) {
          if (isTvItem) {
            episodeData = await resolveTvData(meta.tvData, searchItem.id);
          }
        }

        return createAutoTracked({
          itemId: searchItem?.id,
          itemType: searchItem?.type,
          tvItemId: episodeData?.id,
          tvItemType: episodeData ? TvItemTypes.Episode : null,
          userId,
          meta,
          createdAt,
        });
      },
    ),
    removeAutoTracked: isAuthenticated.createResolver(
      async (parent, { ids }: { ids: Array<string> }, { user }) => {
        const items = await getAutoTrackedByIds(ids);
        const isOwner = !items.some(({ userId }) => userId !== user.id);

        if (!isOwner) throw 'uh oh';

        await deleteAutoTracked(ids);
        return ids;
      },
    ),
    convertAutoTracked: isAuthenticated.createResolver(
      async (parent, { ids }: { ids: Array<string> }, { user }) => {
        const items = await getAutoTrackedByIds(ids).withGraphFetched(
          '[movie, tv]',
        );
        const isOwner = !items.some(({ userId }) => userId !== user.id);
        const hasItems = !items.some(({ movie, tv }) => !movie && !tv);

        if (!isOwner) throw 'uh oh';
        if (!hasItems) throw 'missing items';

        const trx = await transaction.start(knex);
        const createWatchedPromise = createWatchedListGraph(
          items.map(
            ({
              userId,
              createdAt,
              movie,
              tv,
              itemType,
              itemId,
              tvItemType,
              tvItemId,
            }) => ({
              userId,
              createdAt,
              tmdbId: movie?.tmdbId || tv?.tmdbId,
              itemType,
              itemId,
              tvItemType,
              tvItemId,
            }),
          ),
          trx,
        );
        const removeAutoTrackedPromsie = deleteAutoTracked(ids);

        const [watched] = await Promise.all([
          createWatchedPromise,
          removeAutoTrackedPromsie,
        ]);
        await trx.commit();

        return {
          removedIds: ids,
          watched,
        };
      },
    ),
  },
  AutoTracked: {
    item: (autoTracked: AutoTracked) => {
      if (!autoTracked.itemType) return null;

      return autoTracked.itemType === ItemTypes.Movie
        ? getMovieById(autoTracked.itemId)
        : getTvById(autoTracked.itemId);
    },
    tvItem: (autoTracked: AutoTracked) => {
      if (!autoTracked.tvItemType) return null;

      return autoTracked.tvItemType === TvItemTypes.Season
        ? getSeasonById(autoTracked.tvItemId)
        : getEpisodeById(autoTracked.tvItemId);
    },
    user: (watched) => getUserById(watched.userId),
  },
  Item: {
    __resolveType(obj) {
      return obj.constructor.name;
    },
  },
  TvItem: {
    __resolveType(obj) {
      return obj.constructor.name;
    },
  },
  // Review: {
  //   watched: (review: Review) => getWatchedById(review.watchedId),
  // },
};

export default resolvers;
