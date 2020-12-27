import { Episode } from '../models/episode/model';
import { Season } from '../models/season/model';
import { Tv } from '../models/tv/model';
import { TmdbEpisode, TmdbSeason, TV } from '../services/TMDB';

export function formatTvEpisodes(
  episodeData: TmdbEpisode[],
  currentData: Episode[],
) {
  return episodeData.map(
    ({ id: tmdbId, air_date, show_id, season_number, ...episode }) => {
      const storedEpisode = currentData.find(
        ({ tmdbId: existingTmdbId }) => existingTmdbId === tmdbId,
      );

      return {
        ...storedEpisode,
        tmdbId,
        air_date: +new Date(air_date) || null,
        ...episode,
      };
    },
  );
}

export function formatTvSeasons(
  seasonData: TmdbSeason[],
  currentData: Season[],
) {
  return seasonData.map(
    ({ id: tmdbId, _id, episodes, air_date, ...season }) => {
      const storedSeason = currentData.find(
        ({ tmdbId: existingTmdbId }) => existingTmdbId === tmdbId,
      );

      return {
        ...storedSeason,
        tmdbId,
        air_date: +new Date(air_date) || null,
        episodes: episodes
          ? formatTvEpisodes(
              episodes,
              storedSeason ? storedSeason.episodes : [],
            )
          : [],
        ...season,
      };
    },
  );
}

export function formatTvItems(items: Tv[], changes: TV[]) {
  return changes.map(({ id, ...item }) => {
    const storedItem = items.find(({ tmdbId }) => tmdbId === id);
    const newItem = {
      ...storedItem,
      ...item,
      tmdbId: id,
      seasons: formatTvSeasons(
        item.seasons,
        storedItem ? storedItem.seasons : [],
      ),
    };

    return newItem;
  });
}
