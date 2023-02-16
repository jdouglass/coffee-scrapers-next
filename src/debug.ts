import { ShopifyClient } from './clients/shopifyClient';
import RossoScraper from './scrapers/rossoScraper';

async function main() {
  await ShopifyClient.run(new RossoScraper());
}

void main();
