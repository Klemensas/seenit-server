import { createReadStream, createWriteStream, ReadStream } from 'fs';
import * as parse from 'csv-parse';
import { Entry, open } from 'yauzl';
import { Readable } from 'stream';

import { searchContent, SearchResult } from '../queries';
import { Watched } from '../watched/model';

const validFiles = ['diary', 'reviews', 'watched', 'ratings'];

export const unzipFile = async (filePath: string) => {
  const records = [];

  await new Promise<any>((resolve, reject) => {
    open(filePath, { lazyEntries: true }, (err, zipfile) => {
      if (err) return reject(err);
      zipfile.readEntry();
      zipfile.on('end', () => resolve(records));
      zipfile.on('error', (err) => reject(err));
      zipfile.on('entry', (entry: Entry) => {
        const fileNameWithoutCsvExtension = entry.fileName.slice(0, -4);
        // Directory file names end with '/'.
        // Note that entries for directories themselves are optional.
        // An entry's fileName implicitly requires its parent directories to exist.
        if (/\/$/.test(entry.fileName)) return zipfile.readEntry();
        else if (!validFiles.includes(fileNameWithoutCsvExtension))
          return zipfile.readEntry();

        zipfile.openReadStream(entry, async (err, readStream) => {
          if (err) return reject(err);

          readStream.on('end', () => zipfile.readEntry());
          try {
            const items = await processCsvStream(readStream);
            records.push({ type: fileNameWithoutCsvExtension, items });
          } catch (err) {
            console.log('eeee', err);
          }
        });
      });
    });
  });

  if (records.length !== validFiles.length) throw 'uh oh';

  records.sort(
    (a, b) => validFiles.indexOf(a.type) - validFiles.indexOf(b.type),
  );

  return transformLetterboxdCsv(records.map(({ items }) => items));
};

const saveCsvStream = async (readStream: Readable, name) => {
  const write = createWriteStream('./' + name + '.csv');
  const pp = new Promise<void>((resolve, reject) => {
    write.on('end', () => resolve());
    write.on('error', (err) => reject(err));
  });
  readStream.pipe(write);
  return pp;
};
const processCsvStream = async (readStream: Readable) => {
  const records = [];
  const parser = readStream.pipe(parse());

  for await (const record of parser) records.push(record);

  return records;
};
const processCsvFile = async (fileName: string) => {
  const records = [];
  const parser = createReadStream(fileName).pipe(parse());

  for await (const record of parser) records.push(record);

  return records;
};

type LetterboxdItem = {
  name: string;
  year: string;
  date: string;
  watchedDate?: string;
  rating?: string;
  review?: string;
};

type MatchedLetterboxItems = {
  item: LetterboxdItem;
  matchingItem?: SearchResult;
};

// export const transformLetterboxdCsv = async ([
//   diaryPath,
//   reviewsPath,
//   watchedPath,
//   ratingsPath,
// ]: string[]) => {
//   const records = await Promise.all([
//     processCsvFile(diaryPath),
//     processCsvFile(reviewsPath),
//     processCsvFile(watchedPath),
//     processCsvFile(ratingsPath),
//   ]);
//   const recordTransformers = [
//     transformLetterboxdCsvDiary,
//     transformLetterboxdCsvReviews,
//     transformLetterboxdCsvWatched,
//     transformLetterboxdCsvRatings,
//   ];

//   const transformedItems = records.reduce(
//     (acc, record) => recordTransformers.shift()(record, acc),
//     {},
//   );

//   const itemsWithMedia = await matchMediaItems(Object.values(transformedItems));
//   const [a, b] = formatWatchedGraphItems(itemsWithMedia);
// };
export const transformLetterboxdCsv = async (records: any[][]) => {
  const recordTransformers = [
    transformLetterboxdCsvDiary,
    transformLetterboxdCsvReviews,
    transformLetterboxdCsvWatched,
    transformLetterboxdCsvRatings,
  ];

  const transformedItems = records.reduce(
    (acc, record) => recordTransformers.shift()(record, acc),
    {},
  );

  const itemsWithMedia = await matchMediaItems(Object.values(transformedItems));
  return formatWatchedGraphItems(itemsWithMedia);
  // const [a, b] = formatWatchedGraphItems(itemsWithMedia);
  // return itemsWithMedia;
};

export const matchMediaItems = async (items: LetterboxdItem[]) => {
  const formattedItems: MatchedLetterboxItems[] = [];

  for (const item of items) {
    const matchingItem = (
      await searchContent(
        {
          title: item.name,
          releaseYear: item.year,
        },
        1,
        ['movie'],
      )
    )[0];
    formattedItems.push({
      item,
      matchingItem,
    });
  }

  return formattedItems;
};

type ImportResultItem = {
  original: LetterboxdItem;
  imported?: Partial<Watched>;
};

export const formatWatchedGraphItems = (items: MatchedLetterboxItems[]) => {
  return items.reduce(
    (acc: Array<ImportResultItem>, { item, matchingItem }) => {
      if (!matchingItem) {
        acc.push({ original: item });

        return acc;
      }

      const { id, tmdbId, type } = matchingItem;

      const sharedProps = {
        tmdbId,
        itemId: id,
        item: matchingItem,
        itemType: type,
        tvItemId: null,
        tvItemType: null,
      };

      const itemForImport = {
        ...sharedProps,
        createdAt: +new Date(item.watchedDate || item.date),
        rating: item.rating && {
          ...sharedProps,
          value: +item.rating,
        },
        review: item.review && {
          ...sharedProps,
          body: item.review,
        },
      };

      const imported = Watched.fromJson(itemForImport, {
        skipValidation: true,
      });

      acc.push({
        original: item,
        imported,
      });
      // acc.push({
      //   ...sharedProps,
      //   userId: '',
      //   createdAt: +new Date(item.watchedDate || item.date),
      //   rating: item.rating && {
      //     ...sharedProps,
      //     value: +item.rating,
      //   },
      //   review: item.review && {
      //     ...sharedProps,
      //     body: item.review,
      //   },
      // });
      return acc;
    },
    [],
  );
};

const transformLetterboxdCsvWatched = (
  records: Array<Array<string>>,
  items: Record<string, LetterboxdItem> = {},
) => {
  const [header, ...rows] = records;
  for (const row of rows) {
    const [date, name, year] = row;
    const key = [name, year].join('~');
    items[key] = {
      ...(items[key] || {}),
      name,
      year,
      date,
    };
  }

  return items;
};

const transformLetterboxdCsvRatings = (
  records: Array<Array<string>>,
  items: Record<string, LetterboxdItem> = {},
) => {
  const [header, ...rows] = records;
  for (const row of rows) {
    const [date, name, year, url, rating] = row;
    const key = [name, year].join('~');

    items[key] = {
      ...(items[key] || {}),
      date,
      name,
      year,
      rating,
    };
  }

  return items;
};

const transformLetterboxdCsvReviews = (
  records: Array<Array<string>>,
  items: Record<string, LetterboxdItem> = {},
) => {
  const [header, ...rows] = records;
  for (const row of rows) {
    const [date, name, year, url, rating, rewatch, review, tags, watchedDate] =
      row;
    const key = [name, year, date].join('~');

    items[key] = {
      ...(items[key] || {}),
      date,
      name,
      year,
      rating,
      review,
      watchedDate,
    };
  }

  return items;
};

const transformLetterboxdCsvDiary = (
  records: Array<Array<string>>,
  items: Record<string, LetterboxdItem> = {},
) => {
  const [header, ...rows] = records;
  for (const row of rows) {
    const [date, name, year, url, rating, rewatch, tags, watchedDate] = row;
    const key = [name, year].join('~');

    items[key] = {
      ...(items[key] || {}),
      date,
      name,
      year,
      rating,
      watchedDate,
    };
  }

  return items;
};
