import { IWordpressRendered } from './wordpressRendered';

export interface IWordpressProductResponseData {
  exerpt: IWordpressRendered;
  guid: IWordpressRendered;
  id: number;
  link: string;
  modified: string;
  slug: string;
  title: IWordpressRendered;
}
