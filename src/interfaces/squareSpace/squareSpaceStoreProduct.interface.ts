import { ISquareSpaceVariant } from './squareSpaceVariant.interface';

export interface ISquareSpaceStoreProduct {
  excerpt: string;
  fullUrl: string;
  id: string;
  publishOn: number;
  title: string;
  updatedOn: number;
  urlId: string;
  variants: ISquareSpaceVariant[];
}
