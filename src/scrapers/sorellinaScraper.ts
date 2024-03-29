import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData.interface';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper.interface';
import { ShopifyBaseScraper } from '../baseScrapers/shopifyBaseScraper';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';
import { BaseUrl } from '../enums/baseUrls';
import { Vendor } from '../enums/vendors';
import { IScraper } from '../interfaces/scrapers/scraper.interface';
import { IShopifyBaseScraper } from '../interfaces/shopify/shopifyBaseScraper.interface';
import { VendorApiUrl } from '../enums/vendorApiUrls';
import { UNKNOWN, UNKNOWN_ARR } from '../constants';

export default class SorellinaScraper
  extends ShopifyBaseScraper
  implements IShopifyScraper, IScraper, IShopifyBaseScraper
{
  private vendor = Vendor.Sorellina;

  getVendorApiUrl = (): string => {
    return VendorApiUrl.Sorellina;
  };

  getVendor = (): string => {
    return this.vendor;
  };

  getBrand = (_item: IShopifyProductResponseData) => {
    return this.vendor;
  };

  getCountry = (item: IShopifyProductResponseData): string => {
    const defaultCountry = 'Unknown';
    for (const country of worldData.keys()) {
      if (item.title.includes(country)) {
        return country;
      }
    }
    return defaultCountry;
  };

  getProcess = (item: IShopifyProductResponseData): string => {
    try {
      const defaultProcess = 'Unknown';
      let process = '';

      if (item.body_html.includes('Process')) {
        process = item.body_html.split('Process')[1];
      } else {
        return defaultProcess;
      }
      process = process.replaceAll('</strong>', '');
      process = process.replaceAll('</span>', '');
      process = process.replaceAll('<br>', '');
      process = process.replaceAll(
        /<(br|span) (d|D)ata-mce-fragment=\"1\">/g,
        ''
      );
      process = process.split(':')[1].trim();
      if (process.includes('<')) {
        process = process.split('<')[0].trim();
      }
      return Helper.firstLetterUppercase(process.split(' ')).join(' ');
    } catch {
      return 'Unknown';
    }
  };

  getProductUrl = (item: IShopifyProductResponseData): string => {
    return BaseUrl.Sorellina + '/collections/beans/products/' + item.handle;
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    if (item.title.includes(' - ')) {
      return item.title.split(' - ')[0].trim();
    }
    return item.title;
  };

  getVariety = (item: IShopifyProductResponseData): string[] => {
    try {
      let variety: string;
      const body: string = item.body_html;
      if (body.includes('Variet')) {
        variety = body.split('Variet')[1];
      } else {
        return UNKNOWN_ARR;
      }
      variety = variety.replaceAll('</strong>', '');
      variety = variety.replaceAll('</span>', '');
      variety = variety.replaceAll('<span>', '');
      variety = variety.replaceAll('<br>', '');
      variety = variety.replaceAll(
        /<(br|span|strong) (d|D)ata-mce-fragment=\"1\">/g,
        ''
      );
      variety = variety.split(':')[1].trim();
      variety = variety.split('<')[0].trim();
      if (variety.includes('SL 34 Ruiru 11')) {
        variety = variety.replace('SL 34 ', 'SL 34, ');
      }
      if (
        variety === 'Red and Yellow Catuai' ||
        variety === 'Red and Yellow Caturra'
      ) {
        return [variety];
      }
      let varietyOptions: string[];
      if (
        variety.includes(', ') ||
        variety.includes(' &amp; ') ||
        variety.includes(' + ') ||
        variety.includes(' and ') ||
        variety.includes(' / ')
      ) {
        varietyOptions = variety.split(/, | \/ | and | \+ | \&amp; /);
      } else {
        varietyOptions = [variety];
      }

      for (let i = 0; i < varietyOptions.length; i++) {
        if (varietyOptions[i].includes('%')) {
          varietyOptions[i] = varietyOptions[i].split('%')[1].trim();
        }
      }
      varietyOptions = Helper.firstLetterUppercase(varietyOptions);
      varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
      return Array.from([...new Set(varietyOptions)]);
    } catch {
      return UNKNOWN_ARR;
    }
  };

  getVarietyString = (item: IShopifyProductResponseData): string => {
    try {
      let variety: string;
      const body: string = item.body_html;
      if (body.includes('Variet')) {
        variety = body.split('Variet')[1];
      } else {
        return UNKNOWN;
      }
      variety = variety.replaceAll('</strong>', '');
      variety = variety.replaceAll('</span>', '');
      variety = variety.replaceAll('<span>', '');
      variety = variety.replaceAll('<br>', '');
      variety = variety.replaceAll(
        /<(br|span|strong) (d|D)ata-mce-fragment=\"1\">/g,
        ''
      );
      variety = variety.split(':')[1].trim();
      variety = variety.split('<')[0].trim();
      if (variety.includes('SL 34 Ruiru 11')) {
        variety = variety.replace('SL 34 ', 'SL 34, ');
      }
      if (
        variety === 'Red and Yellow Catuai' ||
        variety === 'Red and Yellow Caturra'
      ) {
        return variety;
      }
      let varietyOptions: string[];
      if (
        variety.includes(', ') ||
        variety.includes(' &amp; ') ||
        variety.includes(' + ') ||
        variety.includes(' and ') ||
        variety.includes(' / ')
      ) {
        varietyOptions = variety.split(/, | \/ | and | \+ | \&amp; /);
      } else {
        varietyOptions = [variety];
      }

      for (let i = 0; i < varietyOptions.length; i++) {
        if (varietyOptions[i].includes('%')) {
          varietyOptions[i] = varietyOptions[i].split('%')[1].trim();
        }
      }
      varietyOptions = Helper.firstLetterUppercase(varietyOptions);
      varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
      return Array.from([...new Set(varietyOptions)]).join(', ');
    } catch {
      return UNKNOWN;
    }
  };

  getWeight = (item: IShopifyProductResponseData): number => {
    const poundToGrams = 453.6;
    for (const variant of item.variants) {
      if (variant.available) {
        if (variant.title.includes('g')) {
          return Number(variant.title.split('g')[0]);
        } else if (variant.title.includes('lb')) {
          return Math.round(
            Number(variant.title.split('lb')[0]) * poundToGrams
          );
        }
      }
    }
    if (item.variants[0].title.includes('g')) {
      return Number(item.variants[0].title.split('g')[0]);
    } else if (item.variants[0].title.includes('lb')) {
      return Math.round(
        Number(item.variants[0].title.split('lb')[0]) * poundToGrams
      );
    }
    return 0;
  };

  getTastingNotes = (item: IShopifyProductResponseData): string[] => {
    let notes = '';
    if (item.body_html.toLowerCase().includes('notes of')) {
      notes = item.body_html.toLowerCase().split('notes of')[1].trim();
    } else if (item.body_html.toLowerCase().includes('we taste')) {
      notes = item.body_html.toLowerCase().split('we taste')[1].trim();
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

  getTastingNotesString = (item: IShopifyProductResponseData): string => {
    let notes = '';
    if (item.body_html.toLowerCase().includes('notes of')) {
      notes = item.body_html.toLowerCase().split('notes of')[1].trim();
    } else if (item.body_html.toLowerCase().includes('we taste')) {
      notes = item.body_html.toLowerCase().split('we taste')[1].trim();
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
