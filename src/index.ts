import Bree from 'bree';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';

const bree = new Bree({
  root: path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    'abstractFactory'
  ),
  jobs: [
    {
      name: 'client',
      cron: '0 * * * *',
    },
  ],
});

await bree.start();
