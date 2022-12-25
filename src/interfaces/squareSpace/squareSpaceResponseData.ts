import { ISquareSpaceItems } from './squareSpaceItems';
import { ISquareSpaceVariant } from './squareSpaceVariant';

export interface ISquareSpaceProductResponseData {
  addedOn: number;
  body: string;
  excerpt: string;
  fullUrl: string;
  id: number;
  items: ISquareSpaceItems[];
  publishOn: number;
  title: string;
  updatedOn: number;
  variants: ISquareSpaceVariant[];
  vendor: string;
}
