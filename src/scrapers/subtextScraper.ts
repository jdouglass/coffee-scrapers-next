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
    let title = item.title.split(' | ')[1];
    title = title.split(' - ')[0].trim();
    for (const country of worldData.keys()) {
      if (title.includes(country)) {
        return country;
      }
    }
    return 'Unknown';
  };

  getProcess = (item: IShopifyProductResponseData): string => {
    let process = item.body_html.split('Process')[1];
    process = process.split('\n')[0].trim();
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
    return item.title.split(' | ')[0].trim();
  };

  getVariety = (item: IShopifyProductResponseData): string[] => {
    let variety = item.body_html.split('Varieties')[1];
    variety = variety.split('\n')[0].trim();
    let varietyOptions = variety
      .split(/, | & /)
      .map((variety: string) => variety.trim());
    varietyOptions = Helper.firstLetterUppercase(varietyOptions);
    varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
    varietyOptions = Array.from([...new Set(varietyOptions)]);
    return varietyOptions;
  };
}
