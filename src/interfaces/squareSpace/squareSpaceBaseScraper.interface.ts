import { CheerioAPI } from 'cheerio';
import { ISquareSpaceProductResponseData } from './squareSpaceResponseData.interface';

export interface ISquareSpaceBaseScraper {
  getBrand?: (item: ISquareSpaceProductResponseData) => string;
  getImageUrl: (item: ISquareSpaceProductResponseData) => string;
  getPrice: (item: ISquareSpaceProductResponseData) => number;
  getSoldOut: ($: CheerioAPI) => boolean;
  getType: (item: ISquareSpaceProductResponseData) => string;
  getWeight: (item: ISquareSpaceProductResponseData) => number;
}
