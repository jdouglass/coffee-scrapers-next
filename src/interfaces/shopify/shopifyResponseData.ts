import { IShopifyImage } from './shopifyImage';
import { IShopifyVariant } from './shopifyVariant';

export interface IShopifyProductResponseData {
  body_html: string;
  handle: string;
  id: number;
  images: IShopifyImage[];
  published_at: string;
  title: string;
  variants: IShopifyVariant[];
  vendor: string;
}
