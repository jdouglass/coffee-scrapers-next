import { CheerioAPI } from 'cheerio';
import { IWordpressProductResponseData } from './wordpressResponseData.interface';

export interface IWordpressScraper {
  getBrand?: () => string;
  getContinent: (country: string) => string;
  getCountry: ($: CheerioAPI) => string;
  getDateAdded: (item: IWordpressProductResponseData) => string;
  getHandle: (slug: string) => string;
  getImageUrl: ($: CheerioAPI) => string;
  getPrice: ($: CheerioAPI) => number;
  getProcess: ($: CheerioAPI) => string;
  getProcessCategory: (process: string) => string;
  getProductUrl?: (link: string) => string;
  getSoldOut: ($: CheerioAPI) => boolean;
  getTitle: ($: CheerioAPI) => string;
  getVariety: ($: CheerioAPI) => string[];
  getWeight: ($: CheerioAPI) => number;
}
