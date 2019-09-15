import * as fs from 'fs';
import * as path from 'path';

export function logError(message, cb = (error) => {}) {
  const stream = fs.createWriteStream(path.resolve(__dirname, 'errors.log'), { flags: 'a' });

  stream.write(`${new Date().toISOString}: ${message}\n`, cb);
}