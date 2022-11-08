import { ICrateJoyImage } from './crateJoyImage';

export interface ICrateJoyProductResponseData {
  id: number;
  images: ICrateJoyImage[];
  name: string;
  slug: string;
}
