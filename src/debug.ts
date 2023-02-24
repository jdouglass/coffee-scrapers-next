import { ShopifyClient } from './clients/shopifyClient';
import MonogramScraper from './scrapers/monogramScraper';

async function main() {
  await ShopifyClient.run(new MonogramScraper());
}

void main();
