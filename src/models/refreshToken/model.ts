import { BaseModel } from '../baseModel';

export class RefreshToken extends BaseModel {
  token: string;

  static tableName = 'RefreshToken';

  static jsonSchema = {
    type: 'object',
    required: ['token'],

    properties: {
      token: { type: 'string' },
    },
  };
}
