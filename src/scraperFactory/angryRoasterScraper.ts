import { ShopifyBaseScraper } from '../baseScrapers/shopifyBaseScraper';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';
import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData.interface';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper.interface';
import { IShopifyVariant } from '../interfaces/shopify/shopifyVariant.interface';

export default class AngryRoasterScraper
  extends ShopifyBaseScraper
  implements IShopifyScraper
{
  getCountry = (item: IShopifyProductResponseData): string => {
    let country = '';
    if (item.body_html.includes('Origin')) {
      country = item.body_html.split('Origin:')[1];
    } else {
      const title = Helper.firstLetterUppercase([item.title]).join();
      for (const country of worldData.keys()) {
        if (title.includes(country)) {
          return country;
        }
      }
    }
    if (country !== '') {
      country = country.replaceAll(/\<.*?\>/g, '\n').trim();
      country = country.split('\n')[0].trim();
      country = Helper.firstLetterUppercase([country]).join();
      if (worldData.has(country)) {
        return country;
      }
    }
    return 'Unknown';
  };

  getProcess = (item: IShopifyProductResponseData): string => {
    let process = '';

    if (item.body_html.includes('Method:')) {
      process = item.body_html.split('Method:')[1];
    } else if (item.body_html.includes('Process:')) {
      process = item.body_html.split('Process:')[1];
    }
    if (process !== '') {
      process = process.replaceAll(/\<.*?\>/g, '\n').trim();
      process = process.split('\n')[0].trim();
      process = Helper.firstLetterUppercase([process]).join();
      return Helper.convertToUniversalProcess(process);
    }
    return 'Unknown';
  };

  getProductUrl = (
    item: IShopifyProductResponseData,
    baseUrl: string
  ): string => {
    return baseUrl + '/collections/all/products/' + item.handle;
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
    let variety: string;
    const body = item.body_html;
    if (body.includes('Variety:')) {
      variety = body.split('Variety:')[1];
      variety = variety.replaceAll(/\<.*?\>/g, '\n').trim();
      variety = variety.split('\n')[0].trim();
      variety = Helper.firstLetterUppercase([variety]).join();
    } else {
      return ['Unknown'];
    }
    let varietyOptions: string[];
    if (variety.includes(',')) {
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
        return variant.grams;
      }
    }
    return item.variants[0].grams;
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    if (item.title.includes('-')) {
      return Helper.firstLetterUppercase([
        item.title.split('-')[0].trim(),
      ]).join();
    }
    return Helper.firstLetterUppercase([item.title]).join();
  };
}
