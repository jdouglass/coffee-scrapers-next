import { HatchClient } from './clients/hatchClient';
// import { PrototypeClient } from './clients/prototypeClient';
import { ShopifyClient } from './clients/shopifyClient';
import { WordpressClient } from './clients/wordpressClient';
import { Vendor } from './enums/vendors';
import AngryRoasterScraper from './scrapers/angryRoasterScraper';
import BlackCreekScraper from './scrapers/blackCreekScraper';
import DeMelloScraper from './scrapers/deMelloScraper';
import EightOunceScraper from './scrapers/eightOunceScraper';
import HeartScraper from './scrapers/heartScraper';
import HouseOfFunkScraper from './scrapers/houseOfFunkScraper';
import LibraryScraper from './scrapers/libraryScraper';
import LunaScraper from './scrapers/lunaScraper';
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
import RevolverScraper from './scrapers/revolverScraper';
import RogueWaveScraper from './scrapers/rogueWaveScraper';
import RossoScraper from './scrapers/rossoScraper';
import SamJamesScraper from './scrapers/samJamesScraper';
import SeptemberScraper from './scrapers/septemberScraper';
import SeyScraper from './scrapers/seyScraper';
import SocialScraper from './scrapers/socialScraper';
import SorellinaScraper from './scrapers/sorellinaScraper';
import SubtextScraper from './scrapers/subtextScraper';
import ThomBargenScraper from './scrapers/thomBargenScraper';
import TimbertrainScraper from './scrapers/timbertrainScraper';
import TrafficScraper from './scrapers/trafficScraper';
import TranscendScraper from './scrapers/transcendScraper';
import ZabCafeScraper from './scrapers/zabCafeScraper';

async function main() {
  const vendor = process.argv[2];
  console.log(vendor);
  if (vendor === Vendor.TheAngryRoaster) {
    await ShopifyClient.run(new AngryRoasterScraper());
  } else if (vendor === Vendor.BlackCreek) {
    await ShopifyClient.run(new BlackCreekScraper());
  } else if (vendor === Vendor.DeMello) {
    await WordpressClient.run(new DeMelloScraper());
  } else if (vendor === Vendor.EightOunce) {
    await ShopifyClient.run(new EightOunceScraper());
  } else if (vendor === Vendor.Hatch) {
    await HatchClient.run();
  } else if (vendor === Vendor.Heart) {
    await ShopifyClient.run(new HeartScraper());
  } else if (vendor === Vendor.HouseOfFunk) {
    await ShopifyClient.run(new HouseOfFunkScraper());
  } else if (vendor === Vendor.Library) {
    await ShopifyClient.run(new LibraryScraper());
  } else if (vendor === Vendor.Luna) {
    await WordpressClient.run(new LunaScraper());
  } else if (vendor === Vendor.Matchstick) {
    await ShopifyClient.run(new MatchstickScraper());
  } else if (vendor === Vendor.Monogram) {
    await ShopifyClient.run(new MonogramScraper());
  } else if (vendor === Vendor.Nemesis) {
    await ShopifyClient.run(new NemesisScraper());
  } else if (vendor === Vendor.Pallet) {
    await ShopifyClient.run(new PalletScraper());
  } else if (vendor === Vendor.PhilAndSebastian) {
    await ShopifyClient.run(new PhilAndSebastianScraper());
  } else if (vendor === Vendor.Pirates) {
    await ShopifyClient.run(new PiratesScraper());
  } else if (vendor === Vendor.PopCoffeeWorks) {
    await ShopifyClient.run(new PopCoffeeWorksScraper());
  } else if (vendor === Vendor.Prodigal) {
    await ShopifyClient.run(new ProdigalScraper());
  } else if (vendor === Vendor.Prototype) {
    // await PrototypeClient.run();
  } else if (vendor === Vendor.Quietly) {
    await ShopifyClient.run(new QuietlyScraper());
  } else if (vendor === Vendor.RabbitHole) {
    await ShopifyClient.run(new RabbitHoleScraper());
  } else if (vendor === Vendor.Revolver) {
    await ShopifyClient.run(new RevolverScraper());
  } else if (vendor === Vendor.RogueWave) {
    await ShopifyClient.run(new RogueWaveScraper());
  } else if (vendor === Vendor.Rosso) {
    await ShopifyClient.run(new RossoScraper());
  } else if (vendor === Vendor.SamJames) {
    await ShopifyClient.run(new SamJamesScraper());
  } else if (vendor === Vendor.September) {
    await ShopifyClient.run(new SeptemberScraper());
  } else if (vendor === Vendor.Sey) {
    await ShopifyClient.run(new SeyScraper());
  } else if (vendor === Vendor.Social) {
    await ShopifyClient.run(new SocialScraper());
  } else if (vendor === Vendor.Sorellina) {
    await ShopifyClient.run(new SorellinaScraper());
  } else if (vendor === Vendor.Subtext) {
    await ShopifyClient.run(new SubtextScraper());
  } else if (vendor === Vendor.ThomBargen) {
    await ShopifyClient.run(new ThomBargenScraper());
  } else if (vendor === Vendor.Timbertrain) {
    await WordpressClient.run(new TimbertrainScraper());
  } else if (vendor === Vendor.Traffic) {
    await ShopifyClient.run(new TrafficScraper());
  } else if (vendor === Vendor.Transcend) {
    await ShopifyClient.run(new TranscendScraper());
  } else if (vendor === Vendor.ZabCafe) {
    await ShopifyClient.run(new ZabCafeScraper());
  } else {
    console.log('Vendor does not exist');
  }
}

void main();
