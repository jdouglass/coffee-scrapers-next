import { IShopifyImage } from './shopifyImage.interface';
import { IShopifyVariant } from './shopifyVariant.interface';

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
