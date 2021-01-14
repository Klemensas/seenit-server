import { execSync } from 'child_process';

const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const syncTargetConnection = process.env.REMOTE_DB_CONNECTION;

const targetTables = ['Movie', 'Tv', 'Season', 'Episode', 'DailyChanges'];
let targetString = targetTables.reduce(
  (acc, table) => acc + `-t "${table}" `,
  '',
);

if (!dbName) throw 'Missing target db variable';
if (!dbUser) throw 'Missing target db user variable';
if (!syncTargetConnection) throw 'Missing sync target connection string';

let command = `pg_dump ${syncTargetConnection} ${targetString} -c | psql -1 -d ${dbName} -U ${dbUser}`;

try {
  const dockerContainerName = 'seenit_postgres';
  execSync(`docker inspect ${dockerContainerName}`);

  console.log('Using docker setup');

  // Add additional wrapping for docker command execution
  targetString = targetString.replace(/"(\w+)"/g, `'\\"$1\\"'`);
  command = `docker exec ${dockerContainerName} bash -c "pg_dump ${syncTargetConnection} ${targetString} -c | psql -1 -d ${dbName} -U ${dbUser}"`;
} catch {
  console.log('Using local postgre instance');
}

console.log(
  `Trying to sync tables - ${targetTables.join(', ')}. This might take a while`,
);
execSync(command);
console.log('Synced successfully');
