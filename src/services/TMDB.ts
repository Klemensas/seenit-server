import axios, { AxiosRequestConfig } from 'axios';

import { config } from '../config';

export interface TMDBResponse<T = any> {
  results: T[];
  page: number;
  total_pages: number;
  total_results: number;
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  original_title: string;
  original_language: string;
  poster_path: string | null;
  genre_ids: number[];
  adult: boolean;
  release_date: string;
  backdrop_path: string | null;
  video: boolean;
  vote_count: number;
  vote_average: number;
  popularity: number;
}
export interface TV {
  id: number;
  name: string;
  overview: string;
  original_name: string;
  original_language: string;
  poster_path: string;
  genre_ids: number[];
  backdrop_path: string | null;
  first_air_date: string;
  origin_country: string[];
  vote_count: number;
  vote_average: number;
  popularity: number;
  seasons: TmdbSeason[];
}

export interface TmdbSeason {
  id: number;
  name?: string;
  overview?: string;
  air_date?: string;
  episode_count?: number;
  poster_path?: string;
  season_number?: number;
  episodes?: TmdbEpisode[];
}

export interface TmdbEpisode {
  id: number;
  air_date?: string;
  episode_number?: number;
  name?: string;
  overview?: string;
  production_code?: string;
  season_number?: number;
  show_id?: number;
  still_path?: string;
  vote_average?: number;
  vote_count?: number;
}

export type MediaType = 'movie' | 'tv';
export type AllMediaType = MediaType | 'person';

export interface Person {
  popularity: number;
  id: number;
  vote_average: number;
  name: string;
  profile_path: string;
  adult: string;
  known_for: Media;
}

export interface SearchParams {
  page?: number;
  language?: string;
  include_adult?: boolean;
  region?: string;
  search_type?: 'phase' | 'ngram';
}

export type Media =
  | ({ media_type: 'movie' } & Movie)
  | ({ media_type: 'tv' } & TV)
  | ({ media_type: 'person' } & Person);

export class TMDB {
  private httpClient = axios.create({
    baseURL: 'https://api.themoviedb.org/3/',
    timeout: 3000,
    params: {
      api_key: this.apikey || 'd2e229b3cd34fc38ed94e2929dc631e9',
    },
  });

  constructor(private apikey: string) {
    this.httpClient.interceptors.request.use((config) => {
      config.params = config.params || {};
      config.params['api_key'] = this.apikey;

      return config;
    });
  }

  get<T = any>(query: string, config?: AxiosRequestConfig) {
    return this.httpClient.get<T>(query, config);
  }

  async search<T = Media>(
    query: string,
    searchParams: SearchParams = { include_adult: false },
    endpoint: 'movie' | 'tv' | 'person' | 'multi' = 'multi',
  ) {
    const result = await this.get<TMDBResponse<T>>('/search/' + endpoint, {
      params: { query, ...searchParams },
    });
    return result.data;
  }

  searchMovies(query: string, searchParams: SearchParams = {}) {
    return this.search<Movie>(query, searchParams, 'movie');
  }

  searchTv(query: string, searchParams: SearchParams = {}) {
    return this.search<TV>(query, searchParams, 'tv');
  }

  searchPeople(query: string, searchParams: SearchParams = {}) {
    return this.search<Person>(query, searchParams, 'person');
  }

  extractLimits(headers: object) {
    return {
      limit: +headers['x-ratelimit-limit'],
      remainingLimit: +headers['x-ratelimit-remaining'],
      nextBatch: +headers['x-ratelimit-reset'],
    };
  }

  getTvWithEpisodes = async (tvId: number, seasons: TmdbSeason[] = []) => {
    const seasonsPerCall = 20;

    const targetSeasons = seasons.length
      ? seasons
          .slice(0, seasonsPerCall)
          .map(({ season_number }) => season_number)
      : Array.from({ length: seasonsPerCall }).map((a, i) => i);
    const params = {
      append_to_response: targetSeasons
        .map((name) => `season/${name}`)
        .join(','),
    };

    let { data, headers } = await this.get<TV>('/tv/' + tvId, {
      params,
      timeout: 0,
    });

    const missingSeasons = this.missingSeasonData(data, seasons);
    if (missingSeasons && missingSeasons.length) {
      const missingData = await this.getTvWithEpisodes(tvId, missingSeasons);
      data = { ...data, ...missingData.data };
      headers = missingData.headers;
    }

    // Bail out if offset present
    if (seasons.length) {
      return { data, headers };
    }

    // Add episode data to season array and remove individual season props
    data.seasons.forEach((season, i) => {
      const seasonTarget = `season/${season.season_number}`;
      data.seasons[i] = { ...season, ...data[seasonTarget] };

      delete data[seasonTarget];
    });

    return { data, headers };
  };

  missingSeasonData(item: TV, seasons: TmdbSeason[]) {
    if (!item.seasons || !item.seasons.length) {
      return null;
    }

    const target = seasons.length ? seasons : item.seasons;
    return target.filter(
      ({ season_number }) => !item[`season/${season_number}`],
    );
  }

  // private async refreshToken() {
  //   const response = await this.httpClient.get<TokenResponse>('/refresh_token');
  //   console.log('new token!', response);
  //   this.setHttpToken(response.data.token);
  // }

  // private setHttpToken(token: string) {
  //   this.httpClient.defaults.headers.Authorization = 'Bearer ' + token;

  //   if (this.settings.refreshToken) {
  //     this.refreshTimer = setTimeout(() => this.refreshToken(), this.settings.refreshToken);
  //   }
  // }
}

export default new TMDB(config.tmDbApikey);
