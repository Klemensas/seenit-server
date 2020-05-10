import { readdirSync } from 'fs';
import { join } from 'path';
import { Model, QueryContext } from 'objection';

export class BaseModel extends Model {
  '#id'?: string;
  '#ref'?: string;
  '#dbRef'?: string;

  id: number | string;
  createdAt?: number;
  updatedAt?: number;

  static get modelPaths() {
    return readdirSync(__dirname, { withFileTypes: true })
      .filter((item) => item.isDirectory())
      .map((dir) => join(__dirname, dir.name));
  }

  $beforeValidate(jsonSchema) {
    jsonSchema.properties.createdAt = { type: ['integer', 'string'] };
    jsonSchema.properties.updatedAt = { type: ['integer', 'string'] };

    return jsonSchema;
  }

  $beforeInsert(queryContext: QueryContext) {
    const date = Date.now();
    this.createdAt = this.createdAt || date;
    this.updatedAt = this.updatedAt || date;
  }

  $beforeUpdate(opt, queryContext: QueryContext) {
    this.updatedAt = Date.now();
  }
}
