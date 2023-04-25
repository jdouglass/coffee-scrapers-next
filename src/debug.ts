import { WordpressClient } from './clients/wordpressClient';
import TimbertrainScraper from './scrapers/timbertrainScraper';

async function main() {
  await WordpressClient.run(new TimbertrainScraper());
}

void main();
