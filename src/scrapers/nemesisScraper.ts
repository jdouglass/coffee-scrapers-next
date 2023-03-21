import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData.interface';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper.interface';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';
import { ShopifyBaseScraper } from '../baseScrapers/shopifyBaseScraper';
import { BaseUrl } from '../enums/baseUrls';
import { Vendor } from '../enums/vendors';
import { IScraper } from '../interfaces/scrapers/scraper.interface';
import { IShopifyBaseScraper } from '../interfaces/shopify/shopifyBaseScraper.interface';
import { VendorApiUrl } from '../enums/vendorApiUrls';

export default class NemesisScraper
  extends ShopifyBaseScraper
  implements IShopifyScraper, IScraper, IShopifyBaseScraper
{
  private vendor = Vendor.Nemesis;
  private vendorApiUrl = VendorApiUrl.Nemesis;

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
    for (const country of worldData.keys()) {
      if (item.title.toLowerCase().includes(country.toLowerCase())) {
        return country;
      }
    }
    return defaultCountry;
  };

  getProcess = (
    _item: IShopifyProductResponseData,
    productDetails?: string[]
  ): string => {
    for (const detail of productDetails!) {
      if (detail.includes('Process')) {
        const processArr = detail.split('\n');
        const process = processArr[processArr.length - 1].trim();
        return Helper.firstLetterUppercase(process.split(' ')).join(' ');
      }
    }
    return 'Unknown';
  };

  getProductUrl = (item: IShopifyProductResponseData): string => {
    return BaseUrl.Nemesis + '/collections/shop-coffee/products/' + item.handle;
  };

  getVariety = (
    _item: IShopifyProductResponseData,
    productDetails?: string[]
  ): string[] => {
    for (const detail of productDetails!) {
      if (detail.includes('Variety')) {
        const variety = detail.split('Variety')[1].trim();
        let varietyArr = variety.split(/, | \/ | and | \+ | \&amp; | \& | \| /);
        varietyArr = Helper.firstLetterUppercase(varietyArr);
        varietyArr = Helper.convertToUniversalVariety(varietyArr);
        return Array.from([...new Set(varietyArr)]);
      }
    }
    return ['Unknown'];
  };

  getWeight = (item: IShopifyProductResponseData): number => {
    const gramsToKg = 1000;
    for (const variant of item.variants) {
      if (variant.available) {
        if (variant.title.includes('g')) {
          return Number(variant.title.split('g')[0]);
        } else if (variant.title.includes('kg')) {
          return Number(variant.title.split('kg')[0]) * gramsToKg;
        }
      }
    }
    if (item.variants[0].title.includes('g')) {
      return Number(item.variants[0].title.split('g')[0]);
    } else if (item.variants[0].title.includes('kg')) {
      return Number(item.variants[0].title.split('kg')[0]) * gramsToKg;
    }
    return 0;
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    if (item.title.includes(' | ')) {
      return item.title.split(' | ')[1].trim();
    }
    return item.title;
  };

  getTastingNotes = (
    _item: IShopifyProductResponseData,
    productDetails?: string[]
  ): string[] => {
    let notes = '';
    for (const detail of productDetails!) {
      if (detail.includes('Notes')) {
        notes = detail.split('Notes')[1].trim();
        const notesArr = notes.split(/, | \/ | and | \+ | \&amp; | \& | \| /);
        return Helper.firstLetterUppercase(notesArr);
      }
    }
    return ['Unknown'];
  };
}
