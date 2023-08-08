import { CheerioAPI } from 'cheerio';

export interface ICrateJoyScraper {
  getBrand?: ($: CheerioAPI) => string;
  getContinent: (country: string) => string;
  getCountry: ($: CheerioAPI) => string;
  getDateAdded: () => string;
  getHandle: (productUrl: string) => string;
  getImageUrl: ($: CheerioAPI) => string;
  getPrice: ($: CheerioAPI) => number;
  getProcess: ($: CheerioAPI) => string;
  getProcessCategory: (process: string) => string;
  getProductUrl: (url: string) => string;
  getSoldOut: ($: CheerioAPI) => boolean;
  getTastingNotes: ($: CheerioAPI) => string[];
  getTastingNotesString: ($: CheerioAPI) => string;
  getTitle: ($: CheerioAPI) => string;
  getType: ($: CheerioAPI, slug: string) => string;
  getVariety: ($: CheerioAPI) => string[];
  getVarietyString: ($: CheerioAPI) => string;
  getWeight: ($: CheerioAPI) => number;
}
