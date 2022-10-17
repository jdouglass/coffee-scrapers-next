import Bree from 'bree';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';

const bree = new Bree({
  root: path.join(path.dirname(fileURLToPath(import.meta.url)), 'clients'),
  jobs: [
    {
      name: 'monogramClient',
      cron: '0 * * * *',
    },
    {
      name: 'piratesClient',
      cron: '0 * * * *',
    },
    {
      name: 'revolverClient',
      cron: '0 * * * *',
    },
    {
      name: 'rogueWaveClient',
      cron: '0 * * * *',
    },
    {
      name: 'rossoClient',
      cron: '0 * * * *',
    },
    {
      name: 'eightOunceClient',
      cron: '0 * * * *',
    },
  ],
});

await bree.start();
