import schedule from 'node-schedule';
import { HatchClient } from './clients/hatchClient';
import { PrototypeClient } from './clients/prototypeClient';
import config from './config.json';

schedule.scheduleJob(
  config.cronSchedule,
  async () => await PrototypeClient.run()
);

schedule.scheduleJob(config.cronSchedule, async () => await HatchClient.run());
