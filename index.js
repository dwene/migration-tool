import Listr from 'listr';

import commandLineArgs from 'command-line-args';
import { migrateSchema } from './tasks/schema.js';
import { migrateFiles } from './tasks/files.js';
import { migrateUsers } from './tasks/users.js';
import { migrateData } from './tasks/data.js';
import * as fs from 'fs';

const commandLineOptions = commandLineArgs([
  {
    name: 'skipCollections',
    alias: 's',
    type: String,
    multiple: true,
    defaultValue: [],
  },
]);

const tasks = new Listr([
  //   {
  //     title: 'Migrating Schema',
  //     task: context => {
  //       context.skipCollections = commandLineOptions.skipCollections;
  //       return migrateSchema(context);
  //     },
  //   },
  //   {
  //     title: 'Migration Files',
  //     task: migrateFiles,
  //   },
  //   {
  //     title: 'Migrating Users',
  //     task: migrateUsers,
  //   },
  {
    title: 'Setup Context',
    task: setupContext,
  },
  {
    title: 'Migrating Data',
    task: migrateData,
  },
  //   {
  //     title: 'Write Context',
  //     task: writeContext,
  //   },
]);

async function writeContext(context) {
  await fs.promises.writeFile('./context/final.json', JSON.stringify(context));
}

console.log(
  `✨ Migrating ${process.env.V8_URL} (v8) to ${process.env.V9_URL} (v9)...`
);

async function setupContext(context) {
  const contextJSON = await fs.promises.readFile(
    './context/final.json',
    'utf8'
  );
  console.log('context', contextJSON);
  const fetchedContext = JSON.parse(contextJSON);
  Object.entries(fetchedContext).forEach(([key, value]) => {
    context[key] = value;
  });
}

tasks
  .run()
  .then(() => {
    console.log('✨ All set! Migration successful.');
  })
  .catch(err => {
    console.error(err);
  });
