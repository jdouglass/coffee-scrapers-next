import { worldData } from '../data/worldData';
import { ProcessCategory } from '../enums/processCategory';
import { IScraper } from '../interfaces/scrapers/scraper.interface';

export class Scraper implements IScraper {
  readonly noImageAvailableUrl =
    'https://via.placeholder.com/300x280.webp?text=No+Image+Available';

  getContinent = (country: string): string => {
    return worldData.get(country) ?? 'Unknown';
  };

  getProcessCategory = (process: string): string => {
    if (
      process === ProcessCategory[ProcessCategory.Washed] ||
      process === ProcessCategory[ProcessCategory.Natural] ||
      process === ProcessCategory[ProcessCategory.Honey] ||
      process === ProcessCategory[ProcessCategory.Unknown]
    ) {
      return process;
    }
    return ProcessCategory[ProcessCategory.Experimental];
  };
}
