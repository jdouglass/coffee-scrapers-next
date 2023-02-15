import { ShopifyClient } from './clients/shopifyClient';
import RevolverScraper from './scrapers/revolverScraper';

async function main() {
  await ShopifyClient.run(new RevolverScraper());
}

void main();
