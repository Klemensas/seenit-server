import * as bcrypt from 'bcrypt';
import { QueryContext } from 'objection';

import { BaseModel } from '../baseModel';
import { Settings } from '../settings/model';
import { Watched } from '../watched/model';

export class User extends BaseModel {
  readonly id: string;
  name: string;
  email: string;
  password: string;
  salt: string;

  watched: Watched[];
  settings: Settings;

  static tableName = 'User';

  static relationMappings = {
    watched: {
      relation: BaseModel.HasManyRelation,
      modelClass: '../watched/model',
      join: {
        from: 'User.id',
        to: 'Watched.userId',
      },
    },
    settings: {
      relation: BaseModel.HasOneRelation,
      modelClass: '../settings/model',
      join: {
        from: 'User.id',
        to: 'Settings.userId',
      },
    },
  };

  static jsonSchema = {
    type: 'object',
    required: ['name', 'email', 'password'],

    properties: {
      id: { type: 'integer' },
      name: { type: 'string', unique: 'true' },
      email: { type: 'string', unique: 'true' },
      password: { type: 'string' },
      salt: { type: 'string' },
    },
  };

  authenticate(password: string) {
    return this.encryptPassword(password).then(
      (encryptedPass) => this.password === encryptedPass,
    );
  }

  encryptPassword(password: string): Promise<string> {
    if (!password || !this.salt) {
      throw new Error('Missing password');
    }

    return bcrypt.hash(password, this.salt);
  }

  generateSalt(rounds = 10) {
    return bcrypt.genSalt(rounds);
  }

  async updatePassword(): Promise<void> {
    if (this.password) {
      if (!this.password || !this.password.length) {
        throw new Error('Invalid password');
      }
    }

    this.salt = await this.generateSalt();
    this.password = await this.encryptPassword(this.password);
  }

  async $beforeInsert(queryContext: QueryContext) {
    super.$beforeInsert(queryContext);
    await this.updatePassword();
  }
}
