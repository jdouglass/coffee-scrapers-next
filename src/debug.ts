import { ShopifyClient } from './clients/shopifyClient';
import EightOunceScraper from './scrapers/eightOunceScraper';

async function main() {
  await ShopifyClient.run(new EightOunceScraper());
}

void main();
