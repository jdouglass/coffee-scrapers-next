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

export default class SeptemberScraper
  extends ShopifyBaseScraper
  implements IShopifyScraper, IScraper, IShopifyBaseScraper
{
  private vendor = Vendor.September;

  getVendorApiUrl = (): string => {
    return VendorApiUrl.September;
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
    if (item.body_html.includes('Origin')) {
      item.body_html = item.body_html.split('Origin')[1];
      item.body_html = item.body_html.replace('</strong>', '');
      item.body_html = item.body_html.split('<')[0];
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

    if (item.body_html.includes('Process')) {
      process = item.body_html.split('Process')[1].trim();
    }

    if (process !== '') {
      process = process.replace(':', '');
      process = process.replace('</strong>', '');
      process = process.replace('</span>', '');
      process = process.replace('<span class="s3">', '');
      process = process.replaceAll('&amp;', ', ');
      process = process.split('<')[0].trim();
      process = Helper.firstLetterUppercase([process]).join();
      return Helper.convertToUniversalProcess(process);
    }
    return 'Unknown';
  };

  getProductUrl = (item: IShopifyProductResponseData): string => {
    return BaseUrl.September + '/products/' + item.handle;
  };

  getVariety = (item: IShopifyProductResponseData): string[] => {
    let variety = '';
    const body = item.body_html;
    if (body.includes('Variety')) {
      variety = body.split('Variety')[1];
    } else {
      return ['Unknown'];
    }
    if (variety !== '') {
      variety = variety.replace(':', '');
      variety = variety.replace('</strong>', '');
      variety = variety.replace('<span class="s3">', '');
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
    if (varietyOptions[0] !== '') {
      return varietyOptions;
    }
    return ['Unknown'];
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    if (item.title.includes('-')) {
      return item.title.split('-')[0].trim();
    }
    return item.title;
  };
}
