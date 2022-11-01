import { IHatchImage } from './hatchImage';

export interface IHatchProductResponseData {
  id: number;
  images: IHatchImage[];
  name: string;
  slug: string;
}
