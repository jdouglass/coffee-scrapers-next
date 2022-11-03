import { Page } from 'puppeteer';
import { IHatchImage } from './hatchImage';

export interface IPuppeteerScraper {
  getBrand?: (page: Page) => string;
  getContinent: (country: string) => string;
  getCountry: (page: Page) => Promise<string>;
  getDateAdded: () => string;
  getHandle: (productUrl: string) => string;
  getImageUrl: (images: IHatchImage[]) => string;
  getPrice: (page: Page) => Promise<number>;
  getProcess: (page: Page) => Promise<string>;
  getProcessCategory: (process: string) => string;
  getProductUrl: (id: number, baseUrl: string) => string;
  getSoldOut: (page: Page) => Promise<boolean>;
  getTitle: (page: Page) => Promise<string>;
  getVariety: (page: Page) => Promise<string[]>;
  getWeight: (slug: string) => number;
}
