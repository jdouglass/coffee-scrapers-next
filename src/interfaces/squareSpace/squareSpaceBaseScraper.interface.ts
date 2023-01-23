import { Page } from 'puppeteer';
import { ISquareSpaceProductResponseData } from './squareSpaceResponseData.interface';

export interface ISquareSpaceBaseScraper {
  getBrand?: (item: ISquareSpaceProductResponseData) => string;
  getImageUrl: (item: ISquareSpaceProductResponseData) => string;
  getPrice: (item: ISquareSpaceProductResponseData) => number;
  getSoldOut: (page: Page) => boolean;
  getWeight: (item: ISquareSpaceProductResponseData) => number;
}
