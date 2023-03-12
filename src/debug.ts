import { ShopifyClient } from './clients/shopifyClient';
import PiratesScraper from './scrapers/piratesScraper';

async function main() {
  await ShopifyClient.run(new PiratesScraper());
}

void main();
