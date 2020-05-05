import { BaseModel } from './baseModel';
import { MediaType } from '../services/TMDB';

export class DailyChanges extends BaseModel {
  readonly id: number;
  batch: number;
  type: MediaType;
  changes: any;

  static tableName = 'DailyChanges';

  static jsonSchema = {
    type: 'object',
    required: ['batch', 'type', 'changes'],

    properties: {
      id: { type: 'integer' },
      batch: { type: 'integer' },
      type: { type: 'string' },
    },
  };
}
