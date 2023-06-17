import { ShopifyBaseScraper } from '../baseScrapers/shopifyBaseScraper';
import { UNKNOWN, UNKNOWN_ARR } from '../constants';
import { worldData } from '../data/worldData';
import { BaseUrl } from '../enums/baseUrls';
import { VendorApiUrl } from '../enums/vendorApiUrls';
import { Vendor } from '../enums/vendors';
import Helper from '../helper/helper';
import { IScraper } from '../interfaces/scrapers/scraper.interface';
import { IShopifyBaseScraper } from '../interfaces/shopify/shopifyBaseScraper.interface';
import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData.interface';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper.interface';

export default class SubtextScraper
  extends ShopifyBaseScraper
  implements IShopifyScraper, IScraper, IShopifyBaseScraper
{
  private vendor = Vendor.Subtext;

  getVendorApiUrl = (): string => {
    return VendorApiUrl.Subtext;
  };

  getVendor = (): string => {
    return this.vendor;
  };

  getBrand = (_item: IShopifyProductResponseData) => {
    return this.vendor;
  };

  getCountry = (item: IShopifyProductResponseData): string => {
    for (const country of worldData.keys()) {
      if (item.title.includes(country)) {
        return country;
      }
    }
    return 'Unknown';
  };

  getProcess = (
    item: IShopifyProductResponseData,
    productDetails?: string[]
  ): string => {
    let process = '';
    if (item.body_html.includes('Process:')) {
      process = item.body_html.split('Process:')[1].trim();
    }
    if (process === '') {
      productDetails?.forEach((detail) => {
        if (detail.includes('Process')) {
          process = detail.split('Process')[1].trim();
          return;
        }
      });
    }
    if (process === '') {
      return 'Unknown';
    }
    if (process.includes('\n')) {
      process = process.split('\n')[0].trim();
    } else if (process.includes('<')) {
      process = process.split('<')[0].trim();
    }
    return Helper.firstLetterUppercase(process.split(' ')).join(' ');
  };

  getProductUrl = (item: IShopifyProductResponseData): string => {
    return (
      BaseUrl.Subtext +
      '/collections/filter-coffee-beans/products/' +
      item.handle
    );
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    for (const country of worldData.keys()) {
      if (item.title.includes(country)) {
        item.title = item.title.replace(country, '').trim();
      }
    }
    if (item.title.includes(', ')) {
      return item.title.split(', ')[0].trim();
    }
    return item.title;
  };

  getVariety = (
    item: IShopifyProductResponseData,
    productDetails?: string[]
  ): string[] => {
    let variety = '';
    if (item.body_html.includes('Varieties')) {
      variety = item.body_html.split('Varieties')[1].trim();
    }
    if (variety === '') {
      productDetails?.forEach((detail) => {
        if (detail.includes('Varieties')) {
          variety = detail.split('Varieties')[1].trim();
        }
      });
    }
    if (variety === '') {
      return UNKNOWN_ARR;
    }
    if (variety.includes('<')) {
      variety = variety.split('<')[0].trim();
    } else if (variety.includes('\n')) {
      variety = variety.split('\n')[0].trim();
    }
    let varietyOptions = variety
      .split(/, | & /)
      .map((variety: string) => variety.split('*')[0].trim());
    varietyOptions = Helper.firstLetterUppercase(varietyOptions);
    varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
    return Array.from([...new Set(varietyOptions)]);
  };

  getVarietyString = (
    item: IShopifyProductResponseData,
    productDetails?: string[]
  ): string => {
    let variety = '';
    if (item.body_html.includes('Varieties')) {
      variety = item.body_html.split('Varieties')[1].trim();
    }
    if (variety === '') {
      productDetails?.forEach((detail) => {
        if (detail.includes('Varieties')) {
          variety = detail.split('Varieties')[1].trim();
        }
      });
    }
    if (variety === '') {
      return UNKNOWN;
    }
    if (variety.includes('<')) {
      variety = variety.split('<')[0].trim();
    } else if (variety.includes('\n')) {
      variety = variety.split('\n')[0].trim();
    }
    let varietyOptions = variety
      .split(/, | & /)
      .map((variety: string) => variety.split('*')[0].trim());
    varietyOptions = Helper.firstLetterUppercase(varietyOptions);
    varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
    return Array.from([...new Set(varietyOptions)]).join(', ');
  };

  getTastingNotes = (
    _item: IShopifyProductResponseData,
    productDetails?: string[]
  ): string[] => {
    let notes = productDetails![productDetails!.length - 1];
    if (notes === '') {
      return UNKNOWN_ARR;
    }
    if (notes.toLowerCase().includes('we find')) {
      notes = notes.toLowerCase().split('we find')[1].trim();
    } else if (notes.toLowerCase().includes('notes of')) {
      notes = notes.toLowerCase().split('notes of')[1].trim();
    } else if (notes.toLowerCase().includes('shows')) {
      notes = notes.toLowerCase().split('shows')[1].trim();
    } else if (notes.toLowerCase().includes('reminding us of')) {
      notes = notes.toLowerCase().split('reminding us of')[1].trim();
    } else {
      return UNKNOWN_ARR;
    }
    if (notes !== '') {
      notes = notes.toLowerCase().replace('tangy notes of', '');
      notes = notes.split('.')[0];
      if (notes.includes('<')) {
        notes = notes.split('<')[0];
      }
    }
    if (notes === '') {
      return UNKNOWN_ARR;
    }
    let notesArr = notes
      .split(/,| \/ | and | \+ | \&amp; | \& /)
      .map((element) => element.trim())
      .filter((element) => element !== '');
    if (notesArr[0] === '') {
      notesArr = [notes];
    }
    return Helper.firstLetterUppercase(notesArr);
  };

  getTastingNotesString = (
    _item: IShopifyProductResponseData,
    productDetails?: string[]
  ): string => {
    let notes = productDetails![productDetails!.length - 1];
    if (notes === '') {
      return UNKNOWN;
    }
    if (notes.toLowerCase().includes('we find')) {
      notes = notes.toLowerCase().split('we find')[1].trim();
    } else if (notes.toLowerCase().includes('notes of')) {
      notes = notes.toLowerCase().split('notes of')[1].trim();
    } else if (notes.toLowerCase().includes('shows')) {
      notes = notes.toLowerCase().split('shows')[1].trim();
    } else if (notes.toLowerCase().includes('reminding us of')) {
      notes = notes.toLowerCase().split('reminding us of')[1].trim();
    } else {
      return UNKNOWN;
    }
    if (notes !== '') {
      notes = notes.toLowerCase().replace('tangy notes of', '');
      notes = notes.split('.')[0];
      if (notes.includes('<')) {
        notes = notes.split('<')[0];
      }
    }
    if (notes === '') {
      return UNKNOWN;
    }
    let notesArr = notes
      .split(/,| \/ | and | \+ | \&amp; | \& /)
      .map((element) => element.trim())
      .filter((element) => element !== '');
    if (notesArr[0] === '') {
      notesArr = [notes];
    }
    return Helper.firstLetterUppercase(notesArr).join(', ');
  };
}
