import { ShopifyClient } from './clients/shopifyClient';
import AngryRoasterScraper from './scrapers/angryRoasterScraper';

async function main() {
  await ShopifyClient.run(new AngryRoasterScraper());
}

void main();
