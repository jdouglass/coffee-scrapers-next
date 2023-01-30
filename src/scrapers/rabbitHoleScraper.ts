import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData.interface';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper.interface';
import { ShopifyBaseScraper } from '../baseScrapers/shopifyBaseScraper';
import Helper from '../helper/helper';

export default class RabbitHoleScraper
  extends ShopifyBaseScraper
  implements IShopifyScraper
{
  getCountry = (item: IShopifyProductResponseData): string => {
    const defaultCountry = 'Unknown';
    if (item.body_html.includes('Country:')) {
      const country = item.body_html.split('Country:')[1];
      return country.split('<')[0].trim();
    }
    return defaultCountry;
  };

  getProcess = (item: IShopifyProductResponseData): string => {
    const defaultProcess = 'Unknown';
    let process = '';

    if (item.body_html.includes('Process:')) {
      process = item.body_html.split('Process:')[1];
      process = process.split('<')[0].trim();
      return Helper.firstLetterUppercase(process.split(' ')).join(' ');
    }
    return defaultProcess;
  };

  getProductUrl = (
    item: IShopifyProductResponseData,
    baseUrl: string
  ): string => {
    return baseUrl + '/collections/all-coffee/products/' + item.handle;
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    return item.title;
  };

  getVariety = (item: IShopifyProductResponseData): string[] => {
    try {
      let variety: string;
      const body: string = item.body_html;
      if (body.includes('Variet')) {
        variety = body.split('Variet')[1];
      } else {
        return ['Unknown'];
      }
      variety = variety.split(':')[1].trim();
      variety = variety.split('<')[0].trim();
      if (variety.includes('SL 34 Ruiru 11')) {
        variety = variety.replace('SL 34 ', 'SL 34, ');
      }
      if (
        variety === 'Red and Yellow Catuai' ||
        variety === 'Red and Yellow Caturra'
      ) {
        return [variety];
      }
      let varietyOptions: string[];
      if (
        variety.includes(', ') ||
        variety.includes(' &amp; ') ||
        variety.includes(' + ') ||
        variety.includes(' and ') ||
        variety.includes(' / ')
      ) {
        varietyOptions = variety.split(/, | \/ | and | \+ | \&amp; /);
      } else {
        varietyOptions = [variety];
      }

      for (let i = 0; i < varietyOptions.length; i++) {
        if (varietyOptions[i].includes('%')) {
          varietyOptions[i] = varietyOptions[i].split('%')[1].trim();
        }
      }
      varietyOptions = Helper.firstLetterUppercase(varietyOptions);
      varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
      varietyOptions = Array.from([...new Set(varietyOptions)]);
      return varietyOptions;
    } catch {
      return ['Unknown'];
    }
  };

  getWeight = (item: IShopifyProductResponseData): number => {
    const gramsToKg = 1000;
    for (const variant of item.variants) {
      if (variant.available) {
        if (variant.title.includes('kg')) {
          return Number(variant.title.split('kg')[0].trim()) * gramsToKg;
        } else if (variant.title.includes('g')) {
          return Number(variant.title.split('g')[0].trim());
        }
      }
    }
    return 0;
  };
}
