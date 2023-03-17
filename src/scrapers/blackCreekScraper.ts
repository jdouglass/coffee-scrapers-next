import { ShopifyBaseScraper } from '../baseScrapers/shopifyBaseScraper';
import { worldData } from '../data/worldData';
import { BaseUrl } from '../enums/baseUrls';
import { VendorApiUrl } from '../enums/vendorApiUrls';
import { Vendor } from '../enums/vendors';
import Helper from '../helper/helper';
import { IScraper } from '../interfaces/scrapers/scraper.interface';
import { IShopifyBaseScraper } from '../interfaces/shopify/shopifyBaseScraper.interface';
import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData.interface';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper.interface';

export default class BlackCreekScraper
  extends ShopifyBaseScraper
  implements IShopifyScraper, IScraper, IShopifyBaseScraper
{
  private vendor = Vendor.BlackCreek;

  getVendorApiUrl = (): string => {
    return VendorApiUrl.BlackCreekSingleOrigin;
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
    if (item.body_html.includes('Blend:')) {
      const countrySet = new Set<string>();
      for (const country of worldData.keys()) {
        if (item.body_html.toLowerCase().includes(country.toLowerCase())) {
          countrySet.add(country);
        }
      }
      if (!countrySet.size) {
        return defaultCountry;
      }
      if (countrySet.size === 1) {
        return [...countrySet][0];
      } else if (countrySet.size > 1) {
        return 'Multiple';
      }
    }
    return defaultCountry;
  };

  getProcess = (item: IShopifyProductResponseData): string => {
    let process = '';

    if (item.body_html.includes('Process:')) {
      process = item.body_html.split('Process:')[1].trim();
    }

    if (process !== '') {
      process = process.replaceAll('&amp;', '');
      process = process.split('<')[0].trim();
      process = Helper.firstLetterUppercase([process]).join();
      return Helper.convertToUniversalProcess(process);
    }
    return 'Unknown';
  };

  getProductUrl = (item: IShopifyProductResponseData): string => {
    return BaseUrl.BlackCreek + '/products/' + item.handle;
  };

  getVariety = (item: IShopifyProductResponseData): string[] => {
    let variety = '';
    const body = item.body_html;
    if (body.includes('Variety:')) {
      variety = body.split('Variety:')[1];
    } else {
      return ['Unknown'];
    }
    if (variety !== '') {
      variety = variety.replaceAll('&amp;', ', ');
      variety = variety.split('<')[0].trim();
      variety = variety
        .split(/[+\/]/)
        .map((item) => item.trim())
        .join(', ');
      variety = Helper.firstLetterUppercase([variety]).join();
    }
    let varietyOptions: string[];
    if (variety.includes(', ')) {
      varietyOptions = variety.split(', ');
    } else {
      varietyOptions = [variety];
    }
    varietyOptions = varietyOptions.map((element) => element.trim());
    varietyOptions = Helper.firstLetterUppercase(varietyOptions);
    varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
    varietyOptions = Array.from([...new Set(varietyOptions)]);
    return varietyOptions;
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    for (const country of worldData.keys()) {
      if (item.title.includes(country)) {
        item.title = item.title.replace(country, '').trim();
      }
    }
    return item.title;
  };

  getWeight = (item: IShopifyProductResponseData): number => {
    const poundToGrams = 453.6;
    for (const variant of item.variants) {
      if (variant.title.includes('g')) {
        return Number(variant.title.split('g')[0].trim());
      } else if (variant.title.includes('lb')) {
        const weightStr = variant.title.split('lb')[0].trim();
        return Math.round(Number(weightStr) * poundToGrams);
      }
    }
    return item.variants[0].grams;
  };
}
