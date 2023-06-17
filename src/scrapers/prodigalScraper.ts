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

export default class ProdigalScraper
  extends ShopifyBaseScraper
  implements IShopifyScraper, IScraper, IShopifyBaseScraper
{
  private vendor = Vendor.Prodigal;
  private vendorApiUrl = VendorApiUrl.Prodigal;

  getVendorApiUrl = (): string => {
    return this.vendorApiUrl;
  };

  getVendor = (): string => {
    return this.vendor;
  };

  getBrand = (_item: IShopifyProductResponseData) => {
    return this.vendor;
  };

  getCountry = (item: IShopifyProductResponseData): string => {
    const title = Helper.firstLetterUppercase([item.title]).join(' ');
    if (item.body_html.includes('Region')) {
      let countryBody = item.body_html.split('Region')[1];
      countryBody = countryBody.split('<')[0].trim();
      for (const country of worldData.keys()) {
        if (title.includes(country) || countryBody.includes(country)) {
          return country;
        }
      }
    }
    return UNKNOWN;
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
      process = process.replace('</strong>', '');
      process = process.replace('</span>', '');
      process = process.replace('<br>', '');
      process = process.replaceAll(
        /<(br|span) (d|D)ata-mce-fragment=\"1\">/g,
        ''
      );
      process = process.split(':')[1].trim();
      if (process.includes('.')) {
        process = process.split('.')[0].trim();
      } else if (process.includes('<')) {
        process = process.split('<')[0].trim();
      }
      if (process === 'Fully Washed') {
        process = 'Washed';
      }
      return Helper.firstLetterUppercase(process.split(' ')).join(' ');
    } catch {
      return 'Unknown';
    }
  };

  getProductUrl = (item: IShopifyProductResponseData): string => {
    return BaseUrl.Prodigal + '/products/' + item.handle;
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    if (item.title.includes(' - ')) {
      return item.title.split(' - ')[0].trim();
    }
    return Helper.firstLetterUppercase([item.title]).join(' ');
  };

  getVariety = (item: IShopifyProductResponseData): string[] => {
    try {
      let variety: string;
      const body: string = item.body_html;
      if (body.includes('Variety')) {
        variety = body.split('Variety')[1];
      } else {
        return UNKNOWN_ARR;
      }
      variety = variety.replace('</strong>', '');
      variety = variety.replaceAll('</span>', '');
      variety = variety.replaceAll('<span>', '');
      variety = variety.replace('<br>', '');
      variety = variety.replaceAll(/<(br|span) data-mce-fragment=\"1\">/g, '');
      variety = variety.replaceAll(/<(br|span) Data-mce-fragment=\"1\">/g, '');
      variety = variety.split(':')[1].trim();
      variety = variety.split('<')[0].trim();
      if (variety.includes('SL 34 Ruiru 11')) {
        variety = variety.replace('SL 34 ', 'SL 34, ');
      }
      if (variety === 'Red and Yellow Catuai') {
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
      if (body.includes('Variety')) {
        variety = body.split('Variety')[1];
      } else {
        return UNKNOWN;
      }
      variety = variety.replace('</strong>', '');
      variety = variety.replaceAll('</span>', '');
      variety = variety.replaceAll('<span>', '');
      variety = variety.replace('<br>', '');
      variety = variety.replaceAll(/<(br|span) data-mce-fragment=\"1\">/g, '');
      variety = variety.replaceAll(/<(br|span) Data-mce-fragment=\"1\">/g, '');
      variety = variety.split(':')[1].trim();
      variety = variety.split('<')[0].trim();
      if (variety.includes('SL 34 Ruiru 11')) {
        variety = variety.replace('SL 34 ', 'SL 34, ');
      }
      if (variety === 'Red and Yellow Catuai') {
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
    const gramsToKg = 1000;
    for (const variant of item.variants) {
      if (variant.available) {
        if (variant.title.includes('grams')) {
          return Number(variant.title.split(' ')[0]);
        } else if (variant.title.includes('kg')) {
          return Number(variant.title.split(' ')[0]) * gramsToKg;
        }
      }
    }
    if (item.variants[0].title.includes('grams')) {
      return Number(item.variants[0].title.split(' ')[0]);
    } else if (item.variants[0].title.includes('kg')) {
      return Number(item.variants[0].title.split(' ')[0]) * gramsToKg;
    }
    return 0;
  };

  getTastingNotes = (
    _item: IShopifyProductResponseData,
    productDetails?: string[]
  ): string[] => {
    if (productDetails && productDetails.length) {
      const notes = Helper.firstLetterUppercase(productDetails[0].split(', '));
      if (notes[0] !== '') {
        return notes;
      }
    }
    return UNKNOWN_ARR;
  };

  getTastingNotesString = (
    _item: IShopifyProductResponseData,
    productDetails?: string[]
  ): string => {
    if (productDetails && productDetails.length) {
      const notes = Helper.firstLetterUppercase(productDetails[0].split(', '));
      if (notes[0] !== '') {
        return notes.join(', ');
      }
    }
    return UNKNOWN;
  };
}
