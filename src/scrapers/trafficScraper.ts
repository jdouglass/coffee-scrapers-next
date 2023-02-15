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

export default class TrafficScraper
  extends ShopifyBaseScraper
  implements IShopifyScraper, IScraper, IShopifyBaseScraper
{
  private vendor = Vendor.Traffic;

  getVendorApiUrl = (): string => {
    return VendorApiUrl.Traffic;
  };

  getVendor = (): string => {
    return this.vendor;
  };

  getBrand = (_item: IShopifyProductResponseData) => {
    return this.vendor;
  };

  getCountry = (item: IShopifyProductResponseData): string => {
    let country = '';
    item.body_html = item.body_html.replace('Origine', '');
    if (item.body_html.includes('Origin')) {
      country = item.body_html.split('Origin')[1].trim();
    }
    if (country !== '') {
      const countryList = new Set<string>();
      country = country.split(':')[1].trim();
      country = country.replace('</strong>', '').trim();
      country = country.replace('</span>', '').trim();
      country = country.replace('<span>', '').trim();
      country = country.replace('<span data-mce-fragment="1">', '').trim();
      country = country.split('<')[0].trim();
      for (const location of worldData.keys()) {
        if (country.toLowerCase().includes(location.toLowerCase())) {
          countryList.add(location);
        }
      }
      if (!countryList.size) {
        return 'Unknown';
      } else if (countryList.size === 1) {
        return countryList.values().next().value as string;
      } else {
        return 'Multiple';
      }
    }
    return 'Unknown';
  };

  getProcess = (item: IShopifyProductResponseData): string => {
    let process = '';

    if (item.body_html.includes('Process')) {
      process = item.body_html.split('Process')[1].trim();
    }

    if (process !== '') {
      if (process.includes(':')) {
        process = process.split(':')[1].trim();
      }
      process = process.replace('</strong>', '').trim();
      process = process.split('<')[0].trim();
      process = process
        .split(/[+\/]/)
        .map((item) => item.trim())
        .join(', ');
      process = Helper.firstLetterUppercase([process]).join();
      return Helper.convertToUniversalProcess(process);
    }
    return 'Unknown';
  };

  getProductUrl = (item: IShopifyProductResponseData): string => {
    return BaseUrl.Traffic + '/products/' + item.handle;
  };

  getVariety = (item: IShopifyProductResponseData): string[] => {
    let variety = '';
    const body = item.body_html;
    if (body.includes('Variet')) {
      variety = body.split('Variet')[1];
    } else if (body.includes('Variété')) {
      variety = body.split('Variété')[1];
    } else {
      return ['Unknown'];
    }
    if (variety !== '') {
      variety = variety.split(':')[1].trim();
      variety = variety.replace('</strong>', '').trim();
      variety = variety.replace('</span>', '').trim();
      variety = variety.split('<')[0].trim();
      variety = variety.replaceAll('&amp;', ', ');
      variety = variety.replaceAll('and', ', ');
      variety = variety
        .split(/[+\/\&]/)
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
    varietyOptions = Helper.firstLetterUppercase(varietyOptions);
    varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
    varietyOptions = Array.from([...new Set(varietyOptions)]);
    return varietyOptions;
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    return Helper.firstLetterUppercase([item.title]).join();
  };

  getWeight = (item: IShopifyProductResponseData): number => {
    const kgToGrams = 1000;
    const poundToGrams = 453.6;
    for (const variant of item.variants) {
      if (variant.available) {
        if (variant.title.includes('kg')) {
          return Number(variant.title.split('kg')[0].trim()) * kgToGrams;
        } else if (variant.title.includes('g')) {
          return Number(variant.title.split('g')[0].trim());
        } else if (variant.title.includes('lb')) {
          const weightStr = variant.title.split('lb')[0].trim();
          return Math.round(Number(weightStr) * poundToGrams);
        }
      }
    }
    if (item.variants[0].title.includes('kg')) {
      return Number(item.variants[0].title.split('kg')[0].trim()) * kgToGrams;
    } else if (item.variants[0].title.includes('g')) {
      return Number(item.variants[0].title.split('g')[0].trim());
    } else if (item.variants[0].title.includes('lb')) {
      const weightStr = item.variants[0].title.split('lb')[0].trim();
      return Math.round(Number(weightStr) * poundToGrams);
    }
    return item.variants[0].grams;
  };
}
