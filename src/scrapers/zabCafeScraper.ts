import { ShopifyBaseScraper } from '../baseScrapers/shopifyBaseScraper';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';
import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData.interface';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper.interface';
import { IShopifyVariant } from '../interfaces/shopify/shopifyVariant.interface';

export default class ZabCafeScraper
  extends ShopifyBaseScraper
  implements IShopifyScraper
{
  getCountry = (item: IShopifyProductResponseData): string => {
    const title = Helper.firstLetterUppercase([item.title]).join();
    let country = '';
    if (item.body_html.includes('ORIGIN')) {
      country = item.body_html.split('ORIGIN')[1];
    }
    if (country !== '') {
      country = country.replace('</td>\n<td>', '').trim();
      country = country.replace('</td><td>', '').trim();
      country = country.split('<')[0].trim();
      country = Helper.firstLetterUppercase([country]).join();
      if (country.includes(',')) {
        const countryOptions = country.split(',');
        country = countryOptions[countryOptions.length - 1].trim();
      }
      if (worldData.has(country)) {
        return country;
      }
    }
    for (const country of worldData.keys()) {
      if (title.toLowerCase().includes(country.toLowerCase())) {
        return country;
      }
    }
    return 'Unknown';
  };

  getProcess = (item: IShopifyProductResponseData): string => {
    let process = '';

    if (item.body_html.includes('PROCESS')) {
      process = item.body_html.split('PROCESS')[1];
    }

    if (process !== '') {
      process = process.replace('</td>\n<td>', '').trim();
      process = process.replace('</td><td>', '').trim();
      process = process.split('<')[0].trim();
      if (process.includes(':')) {
        process = process.split(':')[1].trim();
      }
      process = process
        .split(/[+\/]/)
        .map((item) => item.trim())
        .join(', ');
      process = Helper.firstLetterUppercase([process]).join();
      return Helper.convertToUniversalProcess(process);
    }
    return 'Unknown';
  };

  getProductUrl = (
    item: IShopifyProductResponseData,
    baseUrl: string
  ): string => {
    return baseUrl + '/en/collections/cafes/products/' + item.handle;
  };

  getSoldOut = (variants: IShopifyVariant[]): boolean => {
    let isAvailable = true;
    for (const variant of variants) {
      if (variant.available) {
        isAvailable = false;
      }
    }
    return isAvailable;
  };

  getVariety = (item: IShopifyProductResponseData): string[] => {
    let variety = '';
    const body = item.body_html;
    if (body.includes('VARIETAL')) {
      variety = body.split('VARIETAL')[1];
    } else if (body.includes('VARIETY')) {
      variety = body.split('VARIETY')[1];
    } else if (body.includes('VARIETIES')) {
      variety = body.split('VARIETIES')[1];
    } else {
      return ['Unknown'];
    }
    if (variety !== '') {
      variety = variety.replace('</td>\n<td>', '').trim();
      variety = variety.replace('</td><td>', '').trim();
      variety = variety.split('<')[0].trim();
      if (variety.includes(':')) {
        variety = variety.split(':')[1].trim();
      }
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

  getWeight = (item: IShopifyProductResponseData): number => {
    for (const variant of item.variants) {
      if (variant.available) {
        if (variant.title.includes('g')) {
          return Number(variant.title.split('g')[0].trim());
        }
      }
    }
    if (item.variants[0].title.includes('g')) {
      return Number(item.variants[0].title.split('g')[0].trim());
    }
    return 0;
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    if (item.title.includes('-')) {
      return Helper.firstLetterUppercase([
        item.title.split('-')[1].trim(),
      ]).join();
    }
    return Helper.firstLetterUppercase([item.title]).join();
  };
}
