import { IShopifyProductResponseData } from './shopifyResponseData.interface';

export interface IShopifyScraper {
  getCountry: (
    item: IShopifyProductResponseData,
    productDetails?: string[]
  ) => Promise<string> | string;
  getProcess: (
    item: IShopifyProductResponseData,
    productDetails?: string[]
  ) => Promise<string> | string;
  getProductUrl: (item: IShopifyProductResponseData, baseUrl: string) => string;
  getTitle: (item: IShopifyProductResponseData) => string;
  getVariety: (
    item: IShopifyProductResponseData,
    productDetails?: string[]
  ) => Promise<string[]> | string[];
}
