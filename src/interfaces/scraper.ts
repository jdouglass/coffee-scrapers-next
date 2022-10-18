import { IImage } from './image';
import { IProductResponseData } from './productResponseData';
import { IVariant } from './variant';

export interface IScraper {
  getBrand?: (item: IProductResponseData) => string;
  getContinent: (country: string) => string;
  getCountry: (item: IProductResponseData) => string;
  getDateAdded: (date: string) => string;
  getHandle: (handle: string) => string;
  getImageUrl: (images: IImage[]) => string;
  getPrice: (variants: IVariant[]) => string;
  getProcess: (item: IProductResponseData) => string;
  getProcessCategory: (process: string) => string;
  getProductUrl: (item: IProductResponseData, baseUrl: string) => string;
  getSoldOut: (variants: IVariant[]) => boolean;
  getTitle: (title: string, brand?: string, country?: string) => string;
  getVariety: (item: IProductResponseData) => string[];
  getWeight: (item: IProductResponseData) => number;
}
