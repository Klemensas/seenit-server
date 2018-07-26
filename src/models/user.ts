import * as crypto from 'crypto';
import { BaseModel } from './baseModel';
import * as bcrypt from 'bcrypt';

export class User extends BaseModel {
  readonly id: number;
  name: string;
  email: string;
  password: string;
  salt: string;

  static tableName = 'User';

  static relationMappings = {};

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

  // get token(): Token {
  //   return { id: this.id, role: this.role };
  // }

  // get profile(): Profile {
  //   return { id: this.id, name: this.name };
  // }

  authenticate(password: string) {
    return this.encryptPassword(password)
      .then((encryptedPass) => this.password === encryptedPass);
  }

  encryptPassword(password: string): Promise<string> {
    if (!password || !this.salt) {
      throw new Error('Missing password');
    }

    return bcrypt.genSalt(10)
      .then((salt) => bcrypt.hash(password, salt));
  }
}
