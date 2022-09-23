import { IImage } from './image';
import { IVariant } from './variant';

export interface IProductResponseData {
  body_html: string;
  handle: string;
  id: number;
  images: IImage[];
  published_at: string;
  title: string;
  variants: IVariant[];
  vendor: string;
}
