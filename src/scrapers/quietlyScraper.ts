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

export default class QuietlyScraper
  extends ShopifyBaseScraper
  implements IShopifyScraper, IScraper, IShopifyBaseScraper
{
  private vendor = Vendor.Quietly;
  private vendorApiUrl = VendorApiUrl.Quietly;

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
    const defaultCountry = 'Unknown';
    let title = item.title;
    title = Helper.firstLetterUppercase([title]).join(' ');
    if (title.includes('Juan Martin')) {
      return 'Colombia';
    }
    for (const country of worldData.keys()) {
      if (title.includes(country)) {
        return country;
      }
    }
    for (const country of worldData.keys()) {
      if (item.body_html.includes(country)) {
        return country;
      }
    }
    return defaultCountry;
  };

  getProcess = (item: IShopifyProductResponseData): string => {
    try {
      const defaultProcess = 'Unknown';
      let process = '';

      if (item.body_html.includes('PROCESS')) {
        process = item.body_html.split('PROCESS')[1];
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
    return BaseUrl.Quietly + '/collections/our-coffee/products/' + item.handle;
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    return Helper.firstLetterUppercase([item.title]).join(' ');
  };

  getVariety = (item: IShopifyProductResponseData): string[] => {
    try {
      let variety: string;
      const body: string = item.body_html;
      if (body.includes('VARIETAL')) {
        variety = body.split('VARIETAL')[1];
        variety = variety.split('ELEVATION')[0];
      } else {
        return ['Unknown'];
      }
      variety = variety.replace(':', '');
      variety = variety.replace('.', '');
      variety = variety.replace(/<[^>]+>/gi, '').trim();
      variety = variety.replaceAll('&amp;', ', ');
      if (variety.includes('SL 34 Ruiru 11')) {
        variety = variety.replace('SL 34 ', 'SL 34, ');
      }
      if (variety === 'Red and Yellow Catuai') {
        return [variety];
      }
      let varietyOptions: string[];
      if (
        variety.includes(', ') ||
        variety.includes('&amp;') ||
        variety.includes(' + ') ||
        variety.includes(' and ') ||
        variety.includes(' / ')
      ) {
        varietyOptions = variety.split(/, | \/ | and | \+ | \&amp; /);
      } else {
        varietyOptions = [variety];
      }
      varietyOptions = varietyOptions.map((element) => element.trim());
      for (let i = 0; i < varietyOptions.length; i++) {
        if (varietyOptions[i].includes('%')) {
          varietyOptions[i] = varietyOptions[i].split('%')[1].trim();
        }
      }
      varietyOptions = Helper.firstLetterUppercase(varietyOptions);
      varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
      varietyOptions = Array.from([...new Set(varietyOptions)]);
      return varietyOptions;
    } catch {
      return ['Unknown'];
    }
  };

  getWeight = (item: IShopifyProductResponseData): number => {
    const poundToGrams = 453.6;
    for (const variant of item.variants) {
      if (variant.available) {
        if (variant.title.includes('Grams')) {
          return Number(variant.title.split(' ')[0]);
        } else if (variant.title.includes('Pounds')) {
          return Number(variant.title.split(' ')[0]) * poundToGrams;
        }
      }
    }
    if (item.variants[0].title.includes('Grams')) {
      return Number(item.variants[0].title.split(' ')[0]);
    } else if (item.variants[0].title.includes('Pounds')) {
      return Number(item.variants[0].title.split(' ')[0]) * poundToGrams;
    }
    return 0;
  };
}
