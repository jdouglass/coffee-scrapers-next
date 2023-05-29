import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData.interface';
import { ShopifyBaseScraper } from '../baseScrapers/shopifyBaseScraper';
import Helper from '../helper/helper';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper.interface';
import { BaseUrl } from '../enums/baseUrls';
import { IScraper } from '../interfaces/scrapers/scraper.interface';
import { Vendor } from '../enums/vendors';
import { IShopifyBaseScraper } from '../interfaces/shopify/shopifyBaseScraper.interface';
import { VendorApiUrl } from '../enums/vendorApiUrls';
import { worldData } from '../data/worldData';
import { MULTIPLE, UNKNOWN, UNKNOWN_ARR } from '../constants';

export default class HeartScraper
  extends ShopifyBaseScraper
  implements IShopifyScraper, IScraper, IShopifyBaseScraper
{
  private vendor = Vendor.Heart;
  private vendorApiUrl = VendorApiUrl.Heart;

  getVendorApiUrl = (): string => {
    return this.vendorApiUrl;
  };

  getVendor = (): string => {
    return this.vendor;
  };

  getBrand = (_item: IShopifyProductResponseData): string => {
    return this.vendor;
  };

  getCountry = (
    item: IShopifyProductResponseData,
    _productDetails?: string[]
  ): string => {
    const countryList = new Set<string>();
    for (const location of worldData.keys()) {
      if (item.title.toLowerCase().includes(location.toLowerCase())) {
        countryList.add(location);
      }
    }
    if (!countryList.size) {
      for (const location of worldData.keys()) {
        if (item.body_html.toLowerCase().includes(location.toLowerCase())) {
          countryList.add(location);
        }
      }
    }
    if (countryList.size === 1) {
      return countryList.values().next().value as string;
    } else if (countryList.size > 1) {
      return MULTIPLE;
    }
    return UNKNOWN;
  };

  getProcess = (
    item: IShopifyProductResponseData,
    _productDetails?: string[]
  ): string => {
    let process = '';
    if (item.body_html.includes('Process:')) {
      process = item.body_html.split('Process:')[1];
    }
    if (process !== '') {
      const processOptions: string[] = process.split('<');
      process = processOptions[0].trim();
      process = Helper.firstLetterUppercase(process.split(' ')).join(' ');
      return Helper.convertToUniversalProcess(process);
    }
    return UNKNOWN;
  };

  getProductUrl = (item: IShopifyProductResponseData): string => {
    return BaseUrl.Heart + '/products/' + item.handle;
  };

  getVariety = (
    item: IShopifyProductResponseData,
    _productDetails?: string[]
  ): string[] => {
    let variety: string = '';
    const body: string = item.body_html;
    if (body.includes('Variety:')) {
      variety = body.split('Variety:')[1];
    } else if (body.includes('Varieties:')) {
      variety = body.split('Varieties:')[1];
    }
    let varietyOptions = [''];
    if (variety !== '') {
      if (variety.includes('<')) {
        varietyOptions = variety.split('<');
        variety = varietyOptions[0].trim();
      }
      if (variety.includes(',')) {
        varietyOptions = variety
          .split(/,\s+/)
          .map((variety: string) => variety.trim());
      } else {
        varietyOptions = [variety];
      }
      varietyOptions = Helper.firstLetterUppercase(varietyOptions);
      varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
      varietyOptions = Array.from([...new Set(varietyOptions)]);
      return varietyOptions;
    }
    return UNKNOWN_ARR;
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    for (const country of worldData.keys()) {
      if (item.title.includes(country)) {
        item.title = item.title.replace(country, '').trim();
      }
    }
    return item.title;
  };

  getTastingNotes = (
    _item: IShopifyProductResponseData,
    productDetails?: string[]
  ): string[] => {
    return Helper.firstLetterUppercase(productDetails!);
  };

  getWeight = (item: IShopifyProductResponseData): number => {
    const ozToGrams = 28.35;
    const poundToGrams = 453;
    for (const variant of item.variants) {
      if (variant.available) {
        if (variant.title.includes('oz')) {
          return Math.round(
            ozToGrams * Number(variant.title.split('oz')[0].trim())
          );
        } else if (variant.title.includes('lb')) {
          return poundToGrams * Number(variant.title.split('oz')[0].trim());
        }
      }
    }
    return item.variants[0].grams;
  };
}
