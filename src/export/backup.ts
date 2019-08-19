import * as fs from 'fs';
import * as path from 'path';
import * as spawn from 'cross-spawn';

const storedDays = 3;

function exportDb(filePath: string) {
  const exec = spawn.sync('docker ps -aqf "name=postgres"');
  const containerId = exec.stdout.toString('utf8').split('\n')[0];

  return new Promise((resolve) => {
    const writeStream = fs.createWriteStream(filePath);
    const dumpStream = spawn(`docker exec -i ${containerId} pg_dump -U screen -Fc`);
    dumpStream.stdout.pipe(writeStream);
    dumpStream.on('close', resolve);
  })
}

function removeOldItem(filePath: string) {
  return new Promise((resolve) => fs.unlink(filePath, (err) => resolve()));
}

async function backupTodaysDb() {
  const date = new Date();
  const name = `./files/db-dump-${date.toISOString().split('T')[0]}`;
  const oldestItem = `./files/db-dump-${new Date(+date - storedDays * 86400000).toISOString().split('T')[0]}`;

  await exportDb(path.resolve(__dirname, name));
  // await uploadFile()
  await removeOldItem(path.resolve(__dirname, oldestItem))
}

backupTodaysDb()