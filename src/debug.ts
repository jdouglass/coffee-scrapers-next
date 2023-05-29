// import { HatchClient } from './clients/hatchClient';
import { ShopifyClient } from './clients/shopifyClient';
import HeartScraper from './scrapers/heartScraper';
// import SeptemberScraper from './scrapers/septemberScraper';

async function main() {
  await ShopifyClient.run(new HeartScraper());
  // await HatchClient.run();
}

void main();
