import { Model, QueryContext } from 'objection';

export class BaseModel extends Model {
  '#id'?: string;
  '#ref'?: string;
  '#dbRef'?: string;

  id: number | string;
  createdAt?: number;
  updatedAt?: number;

  static get modelPaths() {
    return [__dirname];
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
