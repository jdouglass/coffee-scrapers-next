import { ShopifyClient } from './clients/shopifyClient';
import HouseOfFunkScraper from './scrapers/houseOfFunkScraper';

async function main() {
  await ShopifyClient.run(new HouseOfFunkScraper());
}

void main();
