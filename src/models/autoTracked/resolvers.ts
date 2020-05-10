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
  getAutoTrackedById,
  getPaginatedAutoTracked,
} from './queries';
import { searchContent } from '../queries';

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
    autoTracked: (parent, { id }) => getAutoTrackedById(id),
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
