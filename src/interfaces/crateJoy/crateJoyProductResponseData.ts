import { ICrateJoyImage } from './crateJoyImage';

export interface ICrateJoyProductResponseData {
  description: string;
  id: number;
  images: ICrateJoyImage[];
  name: string;
  slug: string;
}
