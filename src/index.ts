import Bree from 'bree';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';
import { IConfig } from './interfaces/config';
import configData from '../src/config.json' assert { type: 'json' };

const config: IConfig = configData;

const bree = new Bree({
  root: path.join(path.dirname(fileURLToPath(import.meta.url)), 'clients'),
  jobs: [
    {
      name: 'monogramClient',
      cron: config.cronSchedule,
    },
    {
      name: 'piratesClient',
      cron: config.cronSchedule,
    },
    {
      name: 'revolverClient',
      cron: config.cronSchedule,
    },
    {
      name: 'rogueWaveClient',
      cron: config.cronSchedule,
    },
    {
      name: 'rossoClient',
      cron: config.cronSchedule,
    },
    {
      name: 'eightOunceClient',
      cron: config.cronSchedule,
    },
  ],
});

await bree.start();
