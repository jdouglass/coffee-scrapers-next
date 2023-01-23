import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData.interface';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper.interface';
import { ShopifyBaseScraper } from '../baseScrapers/shopifyBaseScraper';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';

export default class QuietlyScraper
  extends ShopifyBaseScraper
  implements IShopifyScraper
{
  getCountry = (item: IShopifyProductResponseData): string => {
    const defaultCountry = 'Unknown';
    let title = item.title;
    title = Helper.firstLetterUppercase([title]).join(' ');
    if (title.includes('Juan Martin')) {
      return 'Colombia';
    }
    for (const country of worldData.keys()) {
      if (title.includes(country)) {
        return country;
      }
    }
    return defaultCountry;
  };

  getProcess = (item: IShopifyProductResponseData): string => {
    try {
      const defaultProcess = 'Unknown';
      let process = '';

      if (item.body_html.includes('PROCESS')) {
        process = item.body_html.split('PROCESS')[1];
      } else {
        return defaultProcess;
      }
      process = process.replace('</strong>', '');
      process = process.replace('</span>', '');
      process = process.replace('<br>', '');
      process = process.replaceAll(
        /<(br|span) (d|D)ata-mce-fragment=\"1\">/g,
        ''
      );
      process = process.split(':')[1].trim();
      if (process.includes('.')) {
        process = process.split('.')[0].trim();
      } else if (process.includes('<')) {
        process = process.split('<')[0].trim();
      }
      if (process === 'Fully Washed') {
        process = 'Washed';
      }
      return Helper.firstLetterUppercase(process.split(' ')).join(' ');
    } catch {
      return 'Unknown';
    }
  };

  getProductUrl = (
    item: IShopifyProductResponseData,
    baseUrl: string
  ): string => {
    return baseUrl + '/collections/our-coffee/products/' + item.handle;
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    return Helper.firstLetterUppercase([item.title]).join(' ');
  };

  getVariety = (item: IShopifyProductResponseData): string[] => {
    try {
      let variety: string;
      const body: string = item.body_html;
      if (body.includes('VARIETAL')) {
        variety = body.split('VARIETAL')[1];
      } else {
        return ['Unknown'];
      }
      variety = variety.replace('</strong>', '');
      variety = variety.replaceAll('</span>', '');
      variety = variety.replaceAll('<span>', '');
      variety = variety.replace('<br>', '');
      variety = variety.replaceAll(/<(br|span) data-mce-fragment=\"1\">/g, '');
      variety = variety.replaceAll(/<(br|span) Data-mce-fragment=\"1\">/g, '');
      variety = variety.split(':')[1].trim();
      variety = variety.split('.')[0].trim();
      if (variety.includes('SL 34 Ruiru 11')) {
        variety = variety.replace('SL 34 ', 'SL 34, ');
      }
      if (variety === 'Red and Yellow Catuai') {
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
    const poundToGrams = 453.6;
    for (const variant of item.variants) {
      if (variant.available) {
        if (variant.title.includes('Grams')) {
          return Number(variant.title.split(' ')[0]);
        } else if (variant.title.includes('Pounds')) {
          return Number(variant.title.split(' ')[0]) * poundToGrams;
        }
      }
    }
    if (item.variants[0].title.includes('Grams')) {
      return Number(item.variants[0].title.split(' ')[0]);
    } else if (item.variants[0].title.includes('Pounds')) {
      return Number(item.variants[0].title.split(' ')[0]) * poundToGrams;
    }
    return 0;
  };
}
