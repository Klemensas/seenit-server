import { createWriteStream } from 'fs';
import { FileUpload } from 'graphql-upload';
import { join } from 'path';
import { finished } from 'stream';

import { config } from '../../config';

import { AuthenticatedContext } from '../../apollo';
import { isAuthenticated } from '../../apollo/helperResolvers';
import { unzipFile } from './service';

export const resolvers = {
  Query: {
    importLetterboxd: isAuthenticated.createResolver(
      async (
        parent,
        { file }: { file: Promise<FileUpload> },
        { user }: AuthenticatedContext,
      ) => {
        const { createReadStream, filename, mimetype, encoding } = await file;

        const stream = createReadStream();

        const fileName = `${user.id}-upload.zip`;
        const filePath = join(config.root, 'tmp', fileName);
        const out = createWriteStream(filePath);

        stream.pipe(out);
        try {
          await new Promise<void>((resolve, reject) =>
            finished(out, (err) => (err ? reject(err) : resolve())),
          );
          const items = await unzipFile(filePath);
          console.log('oho', items);
          return items;
        } catch (err) {
          console.log('uh oh', err);
          throw 'eh';
        }
      },
    ),
  },
};
