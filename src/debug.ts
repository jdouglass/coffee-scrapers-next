import { ShopifyClient } from './clients/shopifyClient';
import BlackCreekScraper from './scrapers/blackCreekScraper';

async function main() {
  await ShopifyClient.run(new BlackCreekScraper());
}

void main();
