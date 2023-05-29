import schedule from 'node-schedule';
import config from './config.json';
import { ShopifyClient } from './clients/shopifyClient';
import { WordpressClient } from './clients/wordpressClient';
import AngryRoasterScraper from './scrapers/angryRoasterScraper';
import EightOunceScraper from './scrapers/eightOunceScraper';
import HouseOfFunkScraper from './scrapers/houseOfFunkScraper';
import LibraryScraper from './scrapers/libraryScraper';
import MatchstickScraper from './scrapers/matchstickScraper';
import MonogramScraper from './scrapers/monogramScraper';
import NemesisScraper from './scrapers/nemesisScraper';
import PalletScraper from './scrapers/palletScraper';
import PhilAndSebastianScraper from './scrapers/philAndSebastianScraper';
import PiratesScraper from './scrapers/piratesScraper';
import PopCoffeeWorksScraper from './scrapers/popCoffeeWorksScraper';
import ProdigalScraper from './scrapers/prodigalScraper';
import QuietlyScraper from './scrapers/quietlyScraper';
import RabbitHoleScraper from './scrapers/rabbitHoleScraper';
import RogueWaveScraper from './scrapers/rogueWaveScraper';
import RossoScraper from './scrapers/rossoScraper';
import SamJamesScraper from './scrapers/samJamesScraper';
import SocialScraper from './scrapers/socialScraper';
import SorellinaScraper from './scrapers/sorellinaScraper';
import SubtextScraper from './scrapers/subtextScraper';
import ThomBargenScraper from './scrapers/thomBargenScraper';
import TrafficScraper from './scrapers/trafficScraper';
import TranscendScraper from './scrapers/transcendScraper';
import ZabCafeScraper from './scrapers/zabCafeScraper';
import DeMelloScraper from './scrapers/deMelloScraper';
import LunaScraper from './scrapers/lunaScraper';
import TimbertrainScraper from './scrapers/timbertrainScraper';
import RevolverScraper from './scrapers/revolverScraper';
import BlackCreekScraper from './scrapers/blackCreekScraper';
import SeptemberScraper from './scrapers/septemberScraper';
import HeartScraper from './scrapers/heartScraper';

// Shopify Scrapers
schedule.scheduleJob(
  config.cronSchedule,
  async () => await ShopifyClient.run(new HeartScraper())
);

schedule.scheduleJob(
  config.cronSchedule,
  async () => await ShopifyClient.run(new SeptemberScraper())
);

schedule.scheduleJob(
  config.cronSchedule,
  async () => await ShopifyClient.run(new BlackCreekScraper())
);
schedule.scheduleJob(
  config.cronSchedule,
  async () => await ShopifyClient.run(new AngryRoasterScraper())
);
schedule.scheduleJob(
  '50 * * * *',
  async () => await ShopifyClient.run(new EightOunceScraper())
);
schedule.scheduleJob(
  config.cronSchedule,
  async () => await ShopifyClient.run(new HouseOfFunkScraper())
);
schedule.scheduleJob(
  config.cronSchedule,
  async () => await ShopifyClient.run(new LibraryScraper())
);
schedule.scheduleJob(
  config.cronSchedule,
  async () => await ShopifyClient.run(new MatchstickScraper())
);
schedule.scheduleJob(
  '55 * * * *',
  async () => await ShopifyClient.run(new MonogramScraper())
);
schedule.scheduleJob(
  config.cronSchedule,
  async () => await ShopifyClient.run(new NemesisScraper())
);
schedule.scheduleJob(
  config.cronSchedule,
  async () => await ShopifyClient.run(new PalletScraper())
);
schedule.scheduleJob(
  config.cronSchedule,
  async () => await ShopifyClient.run(new PhilAndSebastianScraper())
);
schedule.scheduleJob(
  config.cronSchedule,
  async () => await ShopifyClient.run(new PiratesScraper())
);
schedule.scheduleJob(
  config.cronSchedule,
  async () => await ShopifyClient.run(new PopCoffeeWorksScraper())
);
schedule.scheduleJob(
  config.cronSchedule,
  async () => await ShopifyClient.run(new ProdigalScraper())
);
schedule.scheduleJob(
  config.cronSchedule,
  async () => await ShopifyClient.run(new QuietlyScraper())
);
schedule.scheduleJob(
  config.cronSchedule,
  async () => await ShopifyClient.run(new RabbitHoleScraper())
);
schedule.scheduleJob(
  config.cronSchedule,
  async () => await ShopifyClient.run(new RevolverScraper())
);
schedule.scheduleJob(
  config.cronSchedule,
  async () => await ShopifyClient.run(new RogueWaveScraper())
);
schedule.scheduleJob(
  config.cronSchedule,
  async () => await ShopifyClient.run(new RossoScraper())
);
schedule.scheduleJob(
  config.cronSchedule,
  async () => await ShopifyClient.run(new SamJamesScraper())
);
schedule.scheduleJob(
  config.cronSchedule,
  async () => await ShopifyClient.run(new SocialScraper())
);
schedule.scheduleJob(
  config.cronSchedule,
  async () => await ShopifyClient.run(new SorellinaScraper())
);
schedule.scheduleJob(
  config.cronSchedule,
  async () => await ShopifyClient.run(new SubtextScraper())
);
schedule.scheduleJob(
  config.cronSchedule,
  async () => await ShopifyClient.run(new ThomBargenScraper())
);
schedule.scheduleJob(
  config.cronSchedule,
  async () => await ShopifyClient.run(new TrafficScraper())
);
schedule.scheduleJob(
  config.cronSchedule,
  async () => await ShopifyClient.run(new TranscendScraper())
);
schedule.scheduleJob(
  config.cronSchedule,
  async () => await ShopifyClient.run(new ZabCafeScraper())
);

// Wordpress Scrapers
schedule.scheduleJob(
  config.cronSchedule,
  async () => await WordpressClient.run(new DeMelloScraper())
);
schedule.scheduleJob(
  config.cronSchedule,
  async () => await WordpressClient.run(new LunaScraper())
);
schedule.scheduleJob(
  config.cronSchedule,
  async () => await WordpressClient.run(new TimbertrainScraper())
);
