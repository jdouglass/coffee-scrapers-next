import { ShopifyClient } from './clients/shopifyClient';
import SeptemberScraper from './scrapers/septemberScraper';

async function main() {
  await ShopifyClient.run(new SeptemberScraper());
}

void main();
