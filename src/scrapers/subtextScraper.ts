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
      return ['Unknown'];
    }
    if (variety.includes('<')) {
      variety = variety.split('<')[0].trim();
    } else if (variety.includes('\n')) {
      variety = variety.split('\n')[0].trim();
    }
    let varietyOptions = variety
      .split(/, | & /)
      .map((variety: string) => variety.trim());
    varietyOptions = Helper.firstLetterUppercase(varietyOptions);
    varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
    varietyOptions = Array.from([...new Set(varietyOptions)]);
    return varietyOptions;
  };
}
