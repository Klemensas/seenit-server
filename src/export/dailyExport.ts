import * as http from 'http';
import * as zlib from 'zlib';
import * as fs from 'fs';
import * as path from 'path';
import * as LineByLineReader from 'line-by-line';

import { knex } from '../config';
import { Movie } from '../models/movie/model';
import { Tv } from '../models/tv/model';
import TMDB, { MediaType } from '../services/TMDB';
import { formatTvItems } from './helpers';

export enum ExportPaths {
  'movie' = 'http://files.tmdb.org/p/exports/movie_ids_',
  'tv' = 'http://files.tmdb.org/p/exports/tv_series_ids_',
}

export interface ExportState {
  movie: number;
  tv: number;
}

export interface ExportJob {
  fileSize: ExportState;
  size: ExportState;
  progress: ExportState;
  filteredItems: ExportState;
  estimatedRemainingMinutes: ExportState;
  start: Date;
  skipStored: boolean;
  skippedLines: number;
}

export class DailyExports {
  static filePath = {
    movie: path.resolve(__dirname, 'daily/movie.json'),
    tv: path.resolve(__dirname, 'daily/tv.json'),
  };

  isRunning = false;
  exportJob: ExportJob = null;
  storedBatch: number[] = [];

  async loadDailies(date: Date, skipStored?: boolean) {
    this.isRunning = true;
    await Promise.all([
      DailyExports.storeDaysExport(date, ExportPaths.movie),
      DailyExports.storeDaysExport(date, ExportPaths.tv),
    ]);
    const [movie, tv] = await Promise.all([
      DailyExports.fileSize(DailyExports.filePath.movie),
      DailyExports.fileSize(DailyExports.filePath.tv),
    ]);

    this.exportJob = {
      fileSize: {
        movie,
        tv,
      },
      size: {
        movie: 0,
        tv: 0,
      },
      estimatedRemainingMinutes: {
        movie: Infinity,
        tv: Infinity,
      },
      progress: {
        movie: 0,
        tv: 0,
      },
      filteredItems: {
        movie: 0,
        tv: 0,
      },
      skipStored,
      skippedLines: 0,
      start: new Date(),
    };

    await this.readFileLines(
      DailyExports.filePath.movie,
      Movie,
      this.parseLine('movie'),
    ).then(() => this.handleBatches('movie'));
    await this.readFileLines(
      DailyExports.filePath.tv,
      Tv,
      this.parseLine('tv'),
    ).then(() => this.handleBatches('tv'));
    await Promise.all([
      new Promise<void>((resolve) =>
        fs.unlink(DailyExports.filePath.movie, () => resolve()),
      ),
      new Promise<void>((resolve) =>
        fs.unlink(DailyExports.filePath.tv, () => resolve()),
      ),
    ]);
    this.isRunning = false;

    console.log('ALL DONE', JSON.stringify(this.exportJob, null, 2));
    process.exit();
  }

  parseLine(type: MediaType) {
    return async (line: string, reader: any, stored: Set<number>) => {
      try {
        const parsedData = JSON.parse(line);

        if (parsedData.adult) return;

        if (this.exportJob.skipStored) {
          const isStored = stored.has(parsedData.id);

          if (isStored) {
            this.exportJob.skippedLines++;
            return;
          }
        }

        this.storedBatch.push(parsedData.id);
        this.exportJob.size[type]++;
      } catch (err) {
        console.error(
          `${err.toString()}-${
            err.response ? JSON.stringify(err.response.headers) : ''
          }`,
        );
        process.exit(1);
      }
    };
  }

  async handleBatches(type: MediaType) {
    const batchSize = 100;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this;

    const started = Date.now();

    async function handleItems(items: number[]) {
      const batchToProcess = items.slice(0, batchSize);

      if (!batchToProcess.length) return;

      const batchItems = await Promise.all(
        batchToProcess.map((id) =>
          DailyExports.fetchItemWithDeletion(id, type),
        ),
      );
      const batchData = batchItems
        .map(({ data }) => data)
        .filter((data) => !!data?.id);
      await context.storeBatch(batchData, type);

      const remainingItems = items.slice(batchSize);

      context.exportJob.progress[type] += batchToProcess.length;
      context.exportJob.filteredItems[type] +=
        batchToProcess.length - batchItems.length;
      const timeSpent = Date.now() - started;
      const timePerItem = timeSpent / context.exportJob.progress[type];
      context.exportJob.estimatedRemainingMinutes[type] =
        (remainingItems.length * timePerItem) / 60000;

      return handleItems(remainingItems);
    }

    this.exportJob.size[type] = this.storedBatch.length;

    await handleItems(this.storedBatch);
    this.storedBatch = [];
  }

  async readFileLines(
    storagePath: string,
    model: typeof Movie | typeof Tv,
    handler: (line: string, reader: any, stored: Set<number>) => void,
  ) {
    const items = await (model as any).query(knex).where({}).select('tmdbId');
    const itemSet = new Set<number>(items.map(({ tmdbId }) => tmdbId));
    return new Promise<void>((resolve, reject) => {
      const lineReader = new LineByLineReader(storagePath);
      lineReader.on('error', (err) => reject(err));
      lineReader.on('end', () => resolve());
      lineReader.on('line', (line: string) =>
        handler(line, lineReader, itemSet),
      );
    });
  }

  async storeBatch<T>(batch: any[], type: MediaType): Promise<T[]> {
    const model = type === 'movie' ? Movie : Tv;
    const tmdbIds = batch.map(({ id }) => id);

    const items = await (model as any).query(knex).whereIn('tmdbId', tmdbIds);
    const insertedTmdbIds = items.map(({ tmdbId }) => tmdbId);

    const filteredBatch = batch.filter(
      ({ id }) => !insertedTmdbIds.includes(id),
    );

    return (model as any).query(knex).insertGraph(
      type === 'tv'
        ? formatTvItems([], filteredBatch)
        : filteredBatch.map(({ id, ...item }) => ({
            ...item,
            tmdbId: id,
          })),
    );
  }

  static async storeDaysExport(date: Date, tmdbUrl: ExportPaths) {
    const dateString = [
      String(date.getUTCMonth() + 1).padStart(2, '0'),
      String(date.getUTCDate()).padStart(2, '0'),
      date.getUTCFullYear(),
    ].join('_');
    const type = tmdbUrl === ExportPaths.movie ? 'movie' : 'tv';
    const storagePath = DailyExports.filePath[type];
    const exists = await DailyExports.fileExists(storagePath);

    if (exists) {
      return;
    }

    const url = `${tmdbUrl}${dateString}.json.gz`;
    fs.mkdirSync(path.dirname(storagePath), { recursive: true });
    const out = fs.createWriteStream(storagePath);
    const gzip = zlib.createGunzip();

    return new Promise<void>((resolve, reject) => {
      http.get(url, (response) => {
        const writeStream = response.pipe(gzip).pipe(out);

        writeStream.on('close', () => resolve());
        writeStream.on('error', (...error) => reject(error));
      });
    });
  }

  static async fileExists(storagePath: string) {
    return new Promise<boolean>((resolve) =>
      fs.exists(storagePath, (exists) => resolve(exists)),
    );
  }

  static async fileSize(storagePath: string) {
    return new Promise<number>((resolve, reject) =>
      fs.stat(storagePath, (err, { size }) => {
        if (err) {
          return reject(err);
        }

        resolve(size);
      }),
    );
  }

  static async fetchItem(id: number, type: MediaType) {
    const { data, headers } = await (type === 'tv'
      ? TMDB.getTvWithEpisodes(id)
      : TMDB.get(`${type}/${id}`, {
          timeout: 0,
        }));

    return {
      data,
      id,
      ...TMDB.extractLimits(headers),
    };
  }

  static async fetchItemWithDeletion(id: number, type: MediaType, attempt = 1) {
    try {
      const result = await this.fetchItem(id, type);
      return result;
    } catch (err) {
      if (err && err.response) {
        const limits = TMDB.extractLimits(err.response.headers);
        if (err.response.status === 404) {
          console.error(`No item - ${id}`);

          return {
            data: null,
            id,
            ...limits,
          };
        }

        if (err.response.status === 504) {
          console.error(`Got timeout for - ${id}, attempt #${attempt}`);

          return this.fetchItemWithDeletion(id, type, attempt + 1);
        }

        if (err.response.status === 429) {
          const retryAfter = +err.response.headers['retry-after'];
          console.error(`Trying to recover - ${id} -- ${err.toString()}`);
          await new Promise<void>((resolve) =>
            setTimeout(() => resolve(), retryAfter * 1000),
          );
          return this.fetchItem(id, type);
        }
      }

      console.error(`Unforseen error - ${id}, type ${type}`);
      throw err;
    }
  }

  static getBinarySize(text: string) {
    return Buffer.byteLength(text, 'utf8');
  }

  static lastBatchItem(requests: any[]) {
    return requests.sort(
      (a, b) =>
        // Remove last number to componsate for API reset time fluctuations
        Math.floor(b.nextBatch / 10) - Math.floor(a.nextBatch / 10) ||
        a.remainingLimit - b.remainingLimit,
    )[0];
  }
}

export default new DailyExports();
