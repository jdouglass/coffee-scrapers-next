import { Page } from 'puppeteer';
import { ISquareSpaceProductResponseData } from './squareSpaceResponseData';

export interface ISquareSpaceScraper {
  getBrand?: (item: ISquareSpaceProductResponseData) => string;
  getContinent: (country: string) => string;
  getCountry: (item: ISquareSpaceProductResponseData) => string;
  getDateAdded: (item: ISquareSpaceProductResponseData) => string;
  getHandle: (item: ISquareSpaceProductResponseData) => string;
  getImageUrl: (image: string) => string;
  getPrice: (item: ISquareSpaceProductResponseData) => number;
  getProcess: (item: ISquareSpaceProductResponseData) => string;
  getProcessCategory: (process: string) => string;
  getProductUrl: (
    baseUrl: string,
    item: ISquareSpaceProductResponseData
  ) => string;
  getSoldOut: (page: Page) => Promise<boolean>;
  getTitle: (item: ISquareSpaceProductResponseData) => string;
  getVariety: (item: ISquareSpaceProductResponseData) => string[];
  getWeight: (item: ISquareSpaceProductResponseData) => number;
}
