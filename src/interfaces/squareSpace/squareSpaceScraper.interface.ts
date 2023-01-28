import { ISquareSpaceProductResponseData } from './squareSpaceResponseData.interface';

export interface ISquareSpaceBaseScraper {
  getDateAdded: (item: ISquareSpaceProductResponseData) => string;
  getHandle: (item: ISquareSpaceProductResponseData) => string;
  getImageUrl: (image: string) => string;
  getPrice: (item: ISquareSpaceProductResponseData) => number;
  getProductUrl: (
    baseUrl: string,
    item: ISquareSpaceProductResponseData
  ) => string;
  getSoldOut: (productUrl: string) => Promise<boolean>;
}
