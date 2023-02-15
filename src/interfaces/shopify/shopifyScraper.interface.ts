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
  getProductUrl: (item: IShopifyProductResponseData) => string;
  getTitle: (item: IShopifyProductResponseData) => string;
  getVariety: (
    item: IShopifyProductResponseData,
    productDetails?: string[]
  ) => Promise<string[]> | string[];
  getVendor: () => string;
  getVendorApiUrl: () => string;
}
