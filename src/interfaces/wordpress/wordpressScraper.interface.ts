import { CheerioAPI } from 'cheerio';
import { IWordpressProductResponseData } from './wordpressResponseData.interface';

export interface IWordpressScraper {
  getBrand?: (item: IWordpressProductResponseData, $?: CheerioAPI) => string;
  getCountry: (item: IWordpressProductResponseData, $?: CheerioAPI) => string;
  getDateAdded: (item: IWordpressProductResponseData) => string;
  getHandle: (slug: string) => string;
  getImageUrl: ($: CheerioAPI) => string;
  getPrice: ($: CheerioAPI) => number;
  getProcess: (item: IWordpressProductResponseData, $?: CheerioAPI) => string;
  getProductUrl: (item: IWordpressProductResponseData) => string;
  getSoldOut: ($: CheerioAPI) => boolean;
  getTastingNotes: (
    item: IWordpressProductResponseData,
    $: CheerioAPI
  ) => string[];
  getTastingNotesString: (
    item: IWordpressProductResponseData,
    $: CheerioAPI
  ) => string;
  getTitle: (item: IWordpressProductResponseData) => string;
  getType: (item: IWordpressProductResponseData) => string;
  getVariety: (item: IWordpressProductResponseData, $?: CheerioAPI) => string[];
  getVarietyString: (
    item: IWordpressProductResponseData,
    $?: CheerioAPI
  ) => string;
  getVendor: () => string;
  getVendorApiUrl: () => string;
  getWeight: (item: IWordpressProductResponseData, $: CheerioAPI) => number;
}
