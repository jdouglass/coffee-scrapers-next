import { IShopifyImage } from './shopifyImage';
import { IShopifyProductResponseData } from './shopifyResponseData';
import { IShopifyVariant } from './shopifyVariant';

export interface IShopifyBaseScraper {
  getBrand?: (item: IShopifyProductResponseData) => string;
  getImageUrl: (images: IShopifyImage[]) => string;
  getPrice: (variants: IShopifyVariant[]) => number;
  getSoldOut: (variants: IShopifyVariant[]) => boolean;
  getWeight: (item: IShopifyProductResponseData) => number;
}
