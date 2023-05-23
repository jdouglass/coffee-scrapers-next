import { HatchClient } from './clients/hatchClient';
// import { ShopifyClient } from './clients/shopifyClient';
// import SeptemberScraper from './scrapers/septemberScraper';

async function main() {
  // await ShopifyClient.run(new SeptemberScraper());
  await HatchClient.run();
}

void main();
