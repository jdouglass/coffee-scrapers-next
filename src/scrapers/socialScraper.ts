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

export default class SocialScraper
  extends ShopifyBaseScraper
  implements IShopifyScraper, IScraper, IShopifyBaseScraper
{
  private vendor = Vendor.Social;

  getVendorApiUrl = (): string => {
    return VendorApiUrl.Social;
  };

  getVendor = (): string => {
    return this.vendor;
  };

  getBrand = (_item: IShopifyProductResponseData) => {
    return this.vendor;
  };

  getCountry = (item: IShopifyProductResponseData): string => {
    const defaultCountry = 'Unknown';
    const countryList: Array<string> = [];
    for (const country of worldData.keys()) {
      if (item.title.includes(country)) {
        countryList.push(country);
      }
    }
    if (countryList.length === 0 && item.body_html.includes('Origin')) {
      let country = item.body_html.split('Origin')[1];
      country = country.split('<')[0];
      country = country.split(':')[1].trim();
      for (const country of worldData.keys()) {
        if (country.includes(country)) {
          countryList.push(country);
        }
      }
    }
    if (countryList.length === 0) {
      return defaultCountry;
    }
    if (countryList.length === 1) {
      return countryList[0];
    }
    return 'Multiple';
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
    return BaseUrl.Social + '/collections/coffee/products/' + item.handle;
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    return item.title.split('-')[0].trim();
  };

  getVariety = (item: IShopifyProductResponseData): string[] => {
    try {
      let variety: string;
      const body: string = item.body_html;
      if (body.includes('Variety')) {
        variety = body.split('Variety')[1];
      } else {
        return ['Unknown'];
      }
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
        if (variant.title.includes('g')) {
          return Number(variant.title.split(' ')[0]);
        } else if (variant.title.includes('lb')) {
          return Number(variant.title.split(' ')[0]) * poundToGrams;
        }
      }
    }
    if (item.variants[0].title.includes('g')) {
      return Number(item.variants[0].title.split(' ')[0]);
    } else if (item.variants[0].title.includes('lb')) {
      return Number(item.variants[0].title.split(' ')[0]) * poundToGrams;
    }
    return item.variants[0].grams;
  };

  getTastingNotes = (item: IShopifyProductResponseData): string[] => {
    let notes = '';
    if (item.body_html.includes('think of...')) {
      notes = item.body_html.split('think of...')[1].trim();
    } else {
      return ['Unknown'];
    }
    if (notes !== '') {
      notes = notes.replace('</span>', '');
      notes = notes.replace('<br>', '');
      notes = notes.replace('<span>', '');
      notes = notes.split('<')[0].trim();
    }
    if (notes === '') {
      return ['Unknown'];
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
}
