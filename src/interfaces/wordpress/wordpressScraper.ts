import { Page } from 'puppeteer';

export interface IWordpressScraper {
  getBrand?: () => string;
  getContinent: (country: string) => string;
  getCountry: (page: Page) => string;
  getDateAdded: (date: string) => string;
  getHandle: (slug: string) => string;
  getImageUrl: (page: Page) => string;
  getPrice: (page: Page) => number;
  getProcess: (page: Page) => string;
  getProcessCategory: (process: string) => string;
  getProductUrl?: (link: string) => string;
  getSoldOut: (page: Page) => boolean;
  getTitle: (page: Page) => string;
  getVariety: (page: Page) => string[];
  getWeight: (page: Page) => number;
}
