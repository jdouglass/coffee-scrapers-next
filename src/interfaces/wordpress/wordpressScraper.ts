import { Page } from 'puppeteer';

export interface IWordpressScraper {
  getBrand?: () => string;
  getContinent: (country: string) => string;
  getCountry: (page: Page) => Promise<string>;
  getDateAdded: () => string;
  getHandle: (slug: string) => string;
  getImageUrl: (page: Page) => Promise<string>;
  getPrice: (page: Page) => Promise<number>;
  getProcess: (page: Page) => Promise<string>;
  getProcessCategory: (process: string) => string;
  getProductUrl?: (link: string) => string;
  getSoldOut: (page: Page) => Promise<boolean>;
  getTitle: (page: Page) => Promise<string>;
  getVariety: (page: Page) => Promise<string[]>;
  getWeight: (page: Page) => Promise<number>;
}
