import { ShopifyBaseScraper } from '../baseScrapers/shopifyBaseScraper';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';
import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData.interface';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper.interface';
import { IShopifyVariant } from '../interfaces/shopify/shopifyVariant.interface';

export default class TranscendScraper
  extends ShopifyBaseScraper
  implements IShopifyScraper
{
  getCountry = (item: IShopifyProductResponseData): string => {
    let country = '';
    for (const country of worldData.keys()) {
      if (item.title.toLowerCase().includes(country.toLowerCase())) {
        return country;
      }
    }
    if (item.body_html.includes('Region:')) {
      country = item.body_html.split('Region:')[1].trim();
      country = country.split('<')[0].trim();
      for (const location of worldData.keys()) {
        if (country.toLowerCase().includes(location.toLowerCase())) {
          return location;
        }
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
      process = process.replace('</span>', '').trim();
      process = process.replace(/<span.*">/, '').trim();
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

  getVariety = (item: IShopifyProductResponseData): string[] => {
    let variety = '';
    const body = item.body_html;
    if (body.includes('Variety:')) {
      variety = body.split('Variety:')[1];
    } else if (body.includes('Varieties:')) {
      variety = body.split('Varieties:')[1];
    } else {
      return ['Unknown'];
    }
    if (variety !== '') {
      variety = variety.replace('</span>', '').trim();
      variety = variety.replace(/<span.*\">/, '').trim();
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
    if (item.title.includes('-')) {
      return Helper.firstLetterUppercase([
        item.title.split('-')[0].trim(),
      ]).join();
    }
    return Helper.firstLetterUppercase([item.title]).join();
  };

  getWeight = (item: IShopifyProductResponseData): number => {
    const poundToGrams = 453.6;
    const threeQuarters = 0.75;
    for (const variant of item.variants) {
      if (variant.available && variant.grams !== 0) {
        return variant.grams;
      }
    }
    for (const variant of item.variants) {
      if (variant.available) {
        if (variant.title.includes('g')) {
          return Number(variant.title.split('g')[0].trim());
        } else if (variant.title.includes('lb')) {
          const weightStr = variant.title.split('lb')[0].trim();
          if (weightStr === '3/4') {
            return Math.round(threeQuarters * poundToGrams);
          }
          return Math.round(Number(weightStr) * poundToGrams);
        }
      }
    }
    if (item.variants[0].title.includes('g')) {
      return Number(item.variants[0].title.split('g')[0].trim());
    } else if (item.variants[0].title.includes('lb')) {
      const weightStr = item.variants[0].title.split('lb')[0].trim();
      if (weightStr === '3/4') {
        return Math.round(threeQuarters * poundToGrams);
      }
      return Math.round(Number(weightStr) * poundToGrams);
    }
    return item.variants[0].grams;
  };
}
