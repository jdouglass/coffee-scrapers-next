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
  getTastingNotes: (
    item: IShopifyProductResponseData,
    productDetails?: string[]
  ) => string[];
  getTastingNotesString: (
    item: IShopifyProductResponseData,
    productDetails?: string[]
  ) => string;
  getTitle: (item: IShopifyProductResponseData) => string;
  getVariety: (
    item: IShopifyProductResponseData,
    productDetails?: string[]
  ) => Promise<string[]> | string[];
  getVarietyString: (
    item: IShopifyProductResponseData,
    productDetails?: string[]
  ) => Promise<string> | string;
  getVendor: () => string;
  getVendorApiUrl: () => string;
}
