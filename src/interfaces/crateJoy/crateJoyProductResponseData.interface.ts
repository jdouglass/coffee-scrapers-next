import { ICrateJoyImage } from './crateJoyImage.interface';

export interface ICrateJoyProductResponseData {
  description: string;
  id: number;
  images: ICrateJoyImage[];
  name: string;
  slug: string;
}
