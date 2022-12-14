import { Page } from 'puppeteer';
import { IShopifyImage } from './shopifyImage';
import { IShopifyProductResponseData } from './shopifyResponseData';
import { IShopifyVariant } from './shopifyVariant';

export interface IShopifyScraper {
  getBrand?: (item: IShopifyProductResponseData) => string;
  getContinent: (country: string) => string;
  getCountry: (
    item: IShopifyProductResponseData,
    page?: Page
  ) => Promise<string> | string;
  getDateAdded: (date: string) => string;
  getHandle: (handle: string) => string;
  getImageUrl: (images: IShopifyImage[]) => string;
  getPrice: (variants: IShopifyVariant[]) => number;
  getProcess: (
    item: IShopifyProductResponseData,
    page?: Page
  ) => Promise<string> | string;
  getProcessCategory: (process: string) => string;
  getProductUrl: (item: IShopifyProductResponseData, baseUrl: string) => string;
  getSoldOut: (variants: IShopifyVariant[]) => boolean;
  getTitle: (
    item: IShopifyProductResponseData,
    brand?: string,
    country?: string
  ) => string;
  getVariety: (
    item: IShopifyProductResponseData,
    page?: Page
  ) => Promise<string[]> | string[];
  getWeight: (item: IShopifyProductResponseData) => number;
}
