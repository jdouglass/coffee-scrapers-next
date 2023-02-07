import { ShopifyBaseScraper } from '../baseScrapers/shopifyBaseScraper';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';
import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData.interface';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper.interface';
import { IShopifyVariant } from '../interfaces/shopify/shopifyVariant.interface';

export default class PhilAndSebastianScraper
  extends ShopifyBaseScraper
  implements IShopifyScraper
{
  getCountry = (item: IShopifyProductResponseData): string => {
    for (const country of worldData.keys()) {
      if (item.title.toLowerCase().includes(country.toLowerCase())) {
        return country;
      }
    }
    return 'Unknown';
  };

  getProcess = (
    _item: IShopifyProductResponseData,
    productDetails?: string[]
  ): string => {
    let process = '';
    for (const detail of productDetails!) {
      if (detail.toLowerCase().includes('process')) {
        process = detail.toLowerCase().split('process')[1].trim();
        if (process.includes(':')) {
          process = process.split(':')[1].trim();
        }
      }
    }
    if (process !== '') {
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
    return baseUrl + '/products/' + item.handle;
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

  getVariety = (
    _item: IShopifyProductResponseData,
    productDetails?: string[]
  ): string[] => {
    let variety = '';
    for (const detail of productDetails!) {
      if (detail.toLowerCase().includes('variet')) {
        variety = detail.toLowerCase().split('variet')[1].trim();
        if (variety.includes(':')) {
          variety = variety.split(':')[1].trim();
        }
      }
    }
    if (variety !== '') {
      variety = variety
        .split(/[+\/\&]/)
        .map((item) => item.trim())
        .join(', ');
      variety = Helper.firstLetterUppercase([variety]).join();
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
    }
    return ['Unknown'];
  };

  getWeight = (item: IShopifyProductResponseData): number => {
    const kgToGrams = 1000;
    for (const variant of item.variants) {
      if (variant.available) {
        if (variant.title.includes('kg')) {
          return Number(variant.title.split('kg')[0].trim()) * kgToGrams;
        } else if (variant.title.includes('g')) {
          return Number(variant.title.split('g')[0].trim());
        }
      }
    }
    if (item.variants[0].title.includes('kg')) {
      return Number(item.variants[0].title.split('kg')[0].trim()) * kgToGrams;
    } else if (item.variants[0].title.includes('g')) {
      return Number(item.variants[0].title.split('g')[0].trim());
    }
    return 0;
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    if (item.title.includes(',')) {
      return Helper.firstLetterUppercase([
        item.title.split(',')[1].trim(),
      ]).join();
    }
    return Helper.firstLetterUppercase([item.title]).join();
  };
}