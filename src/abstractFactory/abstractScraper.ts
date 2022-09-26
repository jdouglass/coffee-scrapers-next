import { IImage } from '../interfaces/image';
import { IProductResponseData } from '../interfaces/productResponseData';
import { IVariant } from '../interfaces/variant';

export interface IScraper {
  getBrand: (item: IProductResponseData) => string;
  getContinent: (country: string) => string;
  getCountry: (item: IProductResponseData) => string;
  getDateAdded: (date: string) => string;
  getHandle: (handle: string) => string;
  getImageUrl: (images: IImage[]) => string;
  getPrice: (variants: IVariant[]) => string;
  getProcess: (body: string) => string;
  getProcessCategory: (process: string) => string;
  getProductUrl: (item: IProductResponseData, baseUrl: string) => string;
  getSoldOut: (variants: IVariant[]) => boolean;
  getTitle: (title: string) => string;
  getVariety: (body: string) => string[];
  getWeight: (variants: IVariant[]) => number;
}
