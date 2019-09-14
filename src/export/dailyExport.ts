import * as http from 'http';
import * as zlib from 'zlib';
import * as fs from 'fs';
import * as path from 'path';
import * as LineByLineReader from 'line-by-line';

import { knex } from '../config';
import { Movie } from '../models/movie';
import { Tv } from '../models/tv';
import TMDB, { MediaType } from '../services/TMDB';
import { formatTvItems } from './changes';

export enum ExportPaths {
  'movie' = 'http://files.tmdb.org/p/exports/movie_ids_',
  'tv' = 'http://files.tmdb.org/p/exports/tv_series_ids_',
}

export interface ExportState {
  total: number;
  movie: number;
  tv: number;
}

export interface ExportJob {
  size: ExportState;
  progress: ExportState;
  start: Date;
  skipStored: boolean;
  skippedLines: number;
  averageTime: number;
  itemsStored: number;
  longestItem: LongestItem;
}

export interface LongestItem {
  time: number;
  id: number;
  type: MediaType;
}

export class DailyExports {
  static filePath = {
    movie: path.resolve(__dirname, 'daily/movie.json'),
    tv: path.resolve(__dirname, 'daily/tv.json'),
  };

  isRunning = false;
  exportJob: ExportJob = null;

  get totalDone() {
    return this.exportJob.progress.total / this.exportJob.size.total;
  }

  get estimate() {
    const timePast = Date.now() - +(this.exportJob.start);
    return 1 / this.totalDone * timePast / 1000;
  }

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
    const total = movie + tv;

    this.exportJob = {
      size: {
        total,
        movie,
        tv,
      },
      progress: {
        total: 0,
        movie: 0,
        tv: 0,
      },
      longestItem: {
        id: null,
        time: null,
        type: null,
      },
      itemsStored: 0,
      averageTime: 0,
      skipStored,
      skippedLines: 0,
      start: new Date(),
    };

    await this.readFileLines(DailyExports.filePath.movie, Movie, this.parseLine('movie'));
    await this.readFileLines(DailyExports.filePath.tv, Tv, this.parseLine('tv'));
    await Promise.all([
      new Promise((resolve) => fs.unlink(DailyExports.filePath.movie, (err) => resolve())),
      new Promise((resolve) => fs.unlink(DailyExports.filePath.tv, (err) => resolve())),
    ]);
    this.isRunning = false;
  }

  parseLine(type: MediaType) {
    let remainingRequests = null;

    return async (line: string, reader: any, stored: Set<number>) => {
      try {
        const itemStart = new Date();
        const parsedData = JSON.parse(line);
        const lineLength = DailyExports.getBinarySize(line) + 1;
        this.exportJob.progress[type] += lineLength;
        this.exportJob.progress.total += lineLength;

        if (parsedData.adult) { return; }
        if (this.exportJob.skipStored) {
          reader.pause();
          const isStored = stored.has(parsedData.id);
          reader.resume();
          if (isStored) {
            this.exportJob.skippedLines++;
            return;
          }
        }

        reader.pause();
        const { data, remainingLimit, nextBatch } = await DailyExports.fetchItemWithDeletion(parsedData.id, type);
        remainingRequests = remainingLimit;

        if (!data) {
          reader.resume();
          return;
        }

        await this.storeBatch([data], type);
        const itemEnd = new Date();
        this.exportJob.itemsStored++;
        this.exportJob.averageTime = (+itemEnd - +this.exportJob.start) / this.exportJob.itemsStored;

        if (!remainingLimit) {
          await new Promise((resolve) => setTimeout(resolve, (nextBatch - Math.floor(Date.now() / 1000)) * 1000 + 1000));
        }

        this.updateLongest({
          type,
          id: parsedData.id,
          time: +itemEnd - +itemStart,
        })
        reader.resume();
        return;
      } catch (err) {
        const stream = fs.createWriteStream(path.resolve(__dirname, 'errors.log'), { flags: 'a' });
        stream.write(`${err.toString()}-${err.response ? JSON.stringify(err.response.headers) : ''}-${remainingRequests}\n`, (error) => {
          process.exit(1);
        });
      }
    };
  }

  updateLongest(itemLength: LongestItem) {
    this.exportJob.longestItem = itemLength.time > this.exportJob.longestItem.time ? itemLength : this.exportJob.longestItem;
  }

  async readFileLines(storagePath: string, model: typeof Movie | typeof Tv, handler: (line: string, reader: any, stored: Set<number>) => void) {
    const items = await (model as any).query(knex).where({}).select('tmdbId');
    const itemSet = new Set<number>(items.map(({ tmdbId }) => tmdbId));
    return new Promise<void>((resolve, reject) => {
      const lineReader = new LineByLineReader(storagePath);
      lineReader.on('error', (err) => reject(err));
      lineReader.on('end', ()  => resolve());
      lineReader.on('line', (line: string) => handler(line, lineReader, itemSet));
    });
  }

  async storeBatch<T>(batch: any[], type: MediaType): Promise<T[]> {
    const model = type === 'movie' ? Movie : Tv;
    const tmdbIds = batch.map(({ id }) => id);

    const items = await (model as any).query(knex).whereIn('tmdbId', tmdbIds);
    const insertedTmdbIds = items.map(({ tmdbId }) => tmdbId);

    const filteredBatch = batch.filter(({ id }) => !insertedTmdbIds.includes(id));

    return (model as any).query(knex).insertGraph(
      type === 'tv' ?
        formatTvItems([], filteredBatch) :
        filteredBatch.map(({ id, ...item }) => ({
          ...item,
          tmdbId: id,
        })),
    );
  }

  static async storeDaysExport(date: Date, tmdbUrl: ExportPaths) {
    const dateString = [String(date.getUTCMonth() + 1).padStart(2, '0'), String(date.getUTCDate()).padStart(2, '0'), date.getUTCFullYear()].join('_');
    const type = tmdbUrl === ExportPaths.movie ? 'movie' : 'tv';
    const storagePath = DailyExports.filePath[type];
    const exists = await DailyExports.fileExists(storagePath);

    if (exists) { return; }

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
    return new Promise<boolean>((resolve) => fs.exists(storagePath, (exists) => resolve(exists)));
  }

  static async fileSize(storagePath: string) {
    return new Promise<number>((resolve, reject) => fs.stat(storagePath, (err, { size }) => {
      if (err) { return reject(err); }

      resolve(size);
    }));
  }

  static async fetchItem(id: number, type: MediaType) {
    const { data, headers } = await (type === 'tv' ? TMDB.getTvWithEpisodes(id) :  TMDB.get(`${type}/${id}`, {
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
          const stream = fs.createWriteStream(path.resolve(__dirname, 'errors.log'), { flags: 'a' });
          stream.write(`No item - ${id}\n`);

          return {
            data: null,
            id,
            ...limits,
          };
        }

        if (err.response.status === 504) {
          const stream = fs.createWriteStream(path.resolve(__dirname, 'errors.log'), { flags: 'a' });
          stream.write(`Got timeout for - ${id}, attempt #${attempt}\n`);

          return this.fetchItemWithDeletion(id, type, attempt + 1);
        }

        if (err.response.status === 429) {
          const retryAfter = +err.response.headers['retry-after'];
          const stream = fs.createWriteStream(path.resolve(__dirname, 'errors.log'), { flags: 'a' });
          stream.write(`Trying to recover - ${id} -- ${err.toString()}\n`);
          await new Promise((resolve) => setTimeout(() => resolve(), retryAfter * 1000));
          return this.fetchItem(id, type);
        }
      }

      throw err;
    }
  }

  static getBinarySize(text: string) {
    return Buffer.byteLength(text, 'utf8');
  }

  static lastBatchItem(requests: any[]) {
    return requests
      .sort((a, b) =>
        // Remove last number to componsate for API reset time fluctuations
        Math.floor(b.nextBatch / 10) - Math.floor(a.nextBatch / 10) ||
        a.remainingLimit - b.remainingLimit,
      )[0];
  }
}

export default new DailyExports();
