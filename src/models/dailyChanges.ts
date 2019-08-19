import { BaseModel } from './baseModel';
import { MediaType } from '../services/TMDB';

export class DailyChanges extends BaseModel {
  readonly id: number;
  type: MediaType;
  inserted: number;
  updated: number;
  deleted: number;

  static tableName = 'DailyChanges';

  static jsonSchema = {
    type: 'object',
    required: ['type', 'inserted', 'updated', 'deleted'],

    properties: {
      id: { type: 'integer' },
      type: { type: 'string' },
      inserted: { type: 'integer' },
      updated: { type: 'integer' },
      deleted: { type: 'integer' },
    },
  };
}
