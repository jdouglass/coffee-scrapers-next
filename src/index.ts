import Bree from 'bree';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';

const bree = new Bree({
  root: path.join(path.dirname(fileURLToPath(import.meta.url)), 'clients'),
  jobs: [
    {
      name: 'monogramClient',
      cron: '*/48 * * * *',
    },
    {
      name: 'piratesClient',
      cron: '*/50 * * * *',
    },
    {
      name: 'revolverClient',
      cron: '*/52 * * * *',
    },
    {
      name: 'rogueWaveClient',
      cron: '*/54 * * * *',
    },
    {
      name: 'rossoClient',
      cron: '*/56 * * * *',
    },
  ],
});

await bree.start();
