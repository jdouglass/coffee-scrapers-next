import Bree from 'bree';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';
import configData from '../src/config.json' assert { type: 'json' };

const cron: string = configData.cronSchedule;

const bree = new Bree({
  root: path.join(path.dirname(fileURLToPath(import.meta.url)), 'clients'),
  jobs: [
    {
      name: 'monogramClient',
      cron,
    },
    {
      name: 'piratesClient',
      cron,
    },
    {
      name: 'revolverClient',
      cron,
    },
    {
      name: 'rogueWaveClient',
      cron,
    },
    {
      name: 'rossoClient',
      cron,
    },
    {
      name: 'eightOunceClient',
      cron,
    },
    {
      name: 'subtextClient',
      cron,
    },
  ],
});

await bree.start();
