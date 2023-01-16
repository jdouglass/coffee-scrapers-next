import { PuppeteerLaunchOptions } from 'puppeteer';
import config from './config.json';

const puppeteerArgs = [
  '--aggressive-cache-discard',
  '--disable-cache',
  '--disable-application-cache',
  '--disable-offline-load-stale-cache',
  '--disable-gpu-shader-disk-cache',
  '--media-cache-size=0',
  '--disk-cache-size=0',
];

export const puppeteerConfig: PuppeteerLaunchOptions = config.devMode
  ? {
      headless: config.isHeadless,
      timeout: config.timeout,
      args: puppeteerArgs,
    }
  : {
      headless: config.isHeadless,
      timeout: config.timeout,
      args: puppeteerArgs,
      executablePath: config.chromePath,
    };
