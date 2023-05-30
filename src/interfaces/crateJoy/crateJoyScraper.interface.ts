import { CheerioAPI } from 'cheerio';
import { ICrateJoyImage } from './crateJoyImage.interface';

export interface ICrateJoyScraper {
  getBrand?: ($: CheerioAPI) => string;
  getContinent: (country: string) => string;
  getCountry: ($: CheerioAPI) => string;
  getDateAdded: () => string;
  getHandle: (productUrl: string) => string;
  getImageUrl: (images: ICrateJoyImage[]) => string;
  getPrice: ($: CheerioAPI) => number;
  getProcess: ($: CheerioAPI) => string;
  getProcessCategory: (process: string) => string;
  getProductUrl: (id: number, baseUrl: string) => string;
  getSoldOut: ($: CheerioAPI) => boolean;
  getTastingNotes: ($: CheerioAPI) => string[];
  getTitle: ($: CheerioAPI) => string;
  getType: ($: CheerioAPI, slug: string) => string;
  getVariety: ($: CheerioAPI) => string[];
  getWeight: (slug: string, description: string) => number;
}
