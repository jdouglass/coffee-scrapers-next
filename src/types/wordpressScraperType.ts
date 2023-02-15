import DeMelloScraper from '../scrapers/deMelloScraper';
import LunaScraper from '../scrapers/lunaScraper';
import TimbertrainScraper from '../scrapers/timbertrainScraper';

export type WordpressScraperType =
  | DeMelloScraper
  | LunaScraper
  | TimbertrainScraper;
