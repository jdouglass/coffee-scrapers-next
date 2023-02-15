export interface IWordpressProductResponseData {
  content: IWordpressRendered;
  excerpt: IWordpressRendered;
  guid: IWordpressRendered;
  id: number;
  link: string;
  modified: string;
  slug: string;
  title: IWordpressRendered;
}

interface IWordpressRendered {
  rendered: string;
}
