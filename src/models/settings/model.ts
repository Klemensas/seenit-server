import { QueryContext } from 'objection';

import { BaseModel } from '../baseModel';
import { User } from '../user/model';

export class Settings extends BaseModel {
  readonly id: string;
  general: {
    autoConvert: boolean;
  };
  extension: {
    autoTrack: boolean;
    minLengthSeconds: number;
    blacklist: string[];
  };

  userId: string;
  user: User;

  static tableName = 'Settings';

  static relationMappings = {
    user: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: '../user/model',
      join: {
        from: 'Settings.userId',
        to: 'User.id',
      },
    },
  };

  static jsonSchema = {
    type: 'object',
    required: ['general', 'extension'],

    properties: {
      id: { type: 'string' },
      userId: { type: 'string' },
    },
  };

  $beforeInsert(queryContext: QueryContext) {
    super.$beforeInsert(queryContext);

    const defaultSettings = {
      general: {
        autoConvert: false,
      },
      extension: {
        autoTrack: false,
        minLengthSeconds: 360,
        blacklist: [],
      },
    };

    this.general = { ...defaultSettings.general, ...this.general };
    this.extension = { ...defaultSettings.extension, ...this.extension };
  }
}
