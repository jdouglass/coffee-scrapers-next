import { IShopifyProductResponseData } from './shopifyResponseData.interface';

export interface IShopifyScraper {
  getCountry: (item: IShopifyProductResponseData) => Promise<string> | string;
  getProcess: (item: IShopifyProductResponseData) => Promise<string> | string;
  getProductUrl: (item: IShopifyProductResponseData, baseUrl: string) => string;
  getTitle: (item: IShopifyProductResponseData) => string;
  getVariety: (
    item: IShopifyProductResponseData
  ) => Promise<string[]> | string[];
}