import { perPage } from '../config/constants';
import { omitFalsy } from './helpers';

export const enum ItemTypes {
  'Movie' = 'Movie',
  'Tv' = 'Tv',
}

export const enum TvItemTypes {
  'Season' = 'Season',
  'Episode' = 'Episode',
}

export type WatchedItemFilters = {
  userId?: string;
  itemId?: string;
  itemType?: ItemTypes;
  tvItemId?: string;
  tvItemType?: TvItemTypes;
};

export type WatchedItemListArgs = WatchedItemFilters & {
  cursor?: string;
};

// TODO: figure out queryFn type or rethink this
export const cursorListResolver =
  (queryFn, resultField = 'watched') =>
  async (
    filters: WatchedItemListArgs,
    cursor: string | number = Date.now(),
  ) => {
    const count = perPage;

    const { total, results } = await queryFn(omitFalsy(filters), {
      count,
      after: cursor,
    });

    const lastItem = results[results.length - 1];
    const newCursor = lastItem?.createdAt;
    const hasMore = total > count;

    return { [resultField]: results, hasMore, cursor: newCursor };
  };
