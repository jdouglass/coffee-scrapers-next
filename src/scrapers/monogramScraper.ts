import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData.interface';
import { ShopifyBaseScraper } from '../baseScrapers/shopifyBaseScraper';
import Helper from '../helper/helper';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper.interface';
import { BaseUrl } from '../enums/baseUrls';
import { IScraper } from '../interfaces/scrapers/scraper.interface';
import { Vendor } from '../enums/vendors';
import { IShopifyBaseScraper } from '../interfaces/shopify/shopifyBaseScraper.interface';
import { VendorApiUrl } from '../enums/vendorApiUrls';

export default class MonogramScraper
  extends ShopifyBaseScraper
  implements IShopifyScraper, IScraper, IShopifyBaseScraper
{
  private vendor = Vendor.Monogram;
  private vendorApiUrl = VendorApiUrl.Monogram;

  getVendorApiUrl = (): string => {
    return this.vendorApiUrl;
  };

  getVendor = (): string => {
    return this.vendor;
  };

  getBrand = (item: IShopifyProductResponseData): string => {
    if (item.handle.includes('atlas')) {
      const titleOptions: string[] = item.title.split('-');
      return titleOptions[0].trim();
    }
    return 'Monogram';
  };

  getCountry = (
    item: IShopifyProductResponseData,
    productDetails?: string[]
  ): string => {
    let country = '';
    if (item.body_html.includes('ORIGIN:')) {
      country = item.body_html.split('ORIGIN:')[1];
    } else if (item.body_html.includes('Origin:')) {
      country = item.body_html.split('Origin:')[1];
    } else {
      for (const detail of productDetails!) {
        if (detail.includes('Origin')) {
          country = detail.split('Origin')[1];
        } else if (detail.includes('ORIGIN')) {
          country = detail.split('ORIGIN')[1];
        }
      }
      if (country !== '') {
        if (country.includes('\n')) {
          country = country.split('\n')[0].trim();
        }
        if (country.includes(':')) {
          country = country.split(':')[1].trim();
        }
      } else {
        return 'Unknown';
      }
    }
    country = country
      .replace('<meta charset="utf-8">', '')
      .split('<')[0]
      .trim();
    if (country.includes(', ')) {
      const countryOptions = country.split(', ');
      country = countryOptions[countryOptions.length - 1].trim();
    }
    if (country === 'TIMOR-LESTE') {
      return 'Timor-Leste';
    }
    return Helper.firstLetterUppercase([country]).join(' ');
  };

  getProcess = (
    item: IShopifyProductResponseData,
    productDetails?: string[]
  ): string => {
    let process = '';
    if (item.body_html.includes('PROCESS:')) {
      process = item.body_html.split('PROCESS:')[1];
    } else if (item.body_html.includes('Process:')) {
      process = item.body_html.split('Process:')[1];
    } else if (item.body_html.includes('Processing:')) {
      process = item.body_html.split('Processing:')[1];
    }

    if (process !== '') {
      process = process.replace('<span>', '');
      const processOptions: string[] = process.split('<');
      process = processOptions[0].trim();
      return Helper.firstLetterUppercase(process.split(' ')).join(' ');
    }
    for (const detail of productDetails!) {
      if (detail.includes('Process')) {
        process = detail.split('Process')[1];
      } else if (detail.includes('PROCESS')) {
        process = detail.split('PROCESS')[1];
      }
    }
    if (process !== '') {
      if (process.includes('\n')) {
        process = process.split('\n')[0].trim();
      }
      if (process.includes(':')) {
        process = process.split(':')[1].trim();
      }
      process = Helper.firstLetterUppercase([process]).join();
      process = Helper.convertToUniversalProcess(process);
      return process;
    }
    return 'Unknown';
  };

  getProductUrl = (item: IShopifyProductResponseData): string => {
    return (
      BaseUrl.Monogram +
      '/products/' +
      item.handle +
      '?variant=' +
      item.variants[0].id.toString()
    );
  };

  getVariety = (
    item: IShopifyProductResponseData,
    productDetails?: string[]
  ): string[] => {
    let variety: string = '';
    const body: string = item.body_html;
    if (body.includes('VARIETY:')) {
      variety = body.split('VARIETY:')[1];
    } else if (body.includes('Variety:')) {
      variety = body.split('Variety:')[1];
    } else {
      for (const detail of productDetails!) {
        if (detail.includes('Variety')) {
          variety = detail.split('Variety')[1];
        } else if (detail.includes('VARIETY')) {
          variety = detail.split('VARIETY')[1];
        }
      }
      if (variety !== '') {
        if (variety.includes('\n')) {
          variety = variety.split('\n')[0].trim();
        }
        if (variety.includes(':')) {
          variety = variety.split(':')[1].trim();
        }
        variety = Helper.firstLetterUppercase([variety]).join();
      } else {
        return ['Unknown'];
      }
    }
    variety = variety.replace('<meta charset="utf-8">', '');
    variety = variety.replace('<span data-mce-fragment="1">', '');
    variety = variety.replace('</span>', '');
    let varietyOptions = [''];
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
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    let titleOptions: string[];
    const title = item.title.replace(/\*.*(Pre|PRE).*\*\s+/, '').trim();
    if (item.handle.includes('atlas')) {
      titleOptions = title.split('-');
      return titleOptions[titleOptions.length - 1].trim();
    }
    if (title.includes('-')) {
      return title.split('-')[0].trim();
    }
    return title;
  };
}
