import { IShopifyImage } from './shopifyImage.interface';
import { IShopifyProductResponseData } from './shopifyResponseData.interface';
import { IShopifyVariant } from './shopifyVariant.interface';

export interface IShopifyBaseScraper {
  getBrand?: (item: IShopifyProductResponseData) => string;
  getDateAdded: (date: string) => string;
  getHandle: (handle: string) => string;
  getImageUrl: (images: IShopifyImage[]) => string;
  getPrice: (variants: IShopifyVariant[]) => number;
  getSoldOut: (variants: IShopifyVariant[]) => boolean;
  getVendorCountryLocation: (vendor: string) => Promise<string>;
  getWeight: (item: IShopifyProductResponseData) => number;
}
