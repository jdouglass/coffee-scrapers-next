import { ProcessCategory } from '../enums/processCategory';
import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData.interface';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper.interface';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';
import { ShopifyBaseScraper } from '../baseScrapers/shopifyBaseScraper';

export default class NemesisScraper
  extends ShopifyBaseScraper
  implements IShopifyScraper
{
  getCountry = (item: IShopifyProductResponseData): string => {
    const defaultCountry = 'Unknown';
    for (const country of worldData.keys()) {
      if (item.title.toLowerCase().includes(country.toLowerCase())) {
        return country;
      }
    }
    return defaultCountry;
  };

  getProcess = (item: IShopifyProductResponseData): string => {
    try {
      const defaultProcess = 'Unknown';
      const maxProcessLength = 75;
      let process = '';

      if (item.body_html.includes('Process')) {
        process = item.body_html.split('Process')[1];
      } else {
        return defaultProcess;
      }
      process = process.replaceAll('</strong>', '');
      process = process.replaceAll('</span>', '');
      process = process.replaceAll('<br>', '');
      process = process.replaceAll('</p>', '');
      process = process.replaceAll('</td>', '');
      process = process.replaceAll(
        /<(br|span|p|td) (d|D)ata-mce-fragment=\"1\">/g,
        ''
      );
      process = process.replaceAll(
        /<(td|span) style=\"(font-weight|width): \d+.?\d+%?;\" data-mce-fragment=\"1\" data-mce-style=\"(font-weight|width): \d+.?\d+%?;\">/g,
        ''
      );
      process = process.replace(/<span style=\"font-weight: 400;\">/, '');

      if (process.includes('<')) {
        process = process.split('<')[0].trim();
      }

      if (process.length >= maxProcessLength) {
        if (item.title.includes(ProcessCategory[ProcessCategory.Washed])) {
          return ProcessCategory[ProcessCategory.Washed];
        } else if (
          item.title.includes(ProcessCategory[ProcessCategory.Natural])
        ) {
          return ProcessCategory[ProcessCategory.Natural];
        } else if (
          item.title.includes(ProcessCategory[ProcessCategory.Honey])
        ) {
          return ProcessCategory[ProcessCategory.Honey];
        } else {
          return defaultProcess;
        }
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
    return baseUrl + '/collections/shop-coffee/products/' + item.handle;
  };

  getVariety = (item: IShopifyProductResponseData): string[] => {
    try {
      let variety: string;
      const body: string = item.body_html;
      if (body.includes('Variety')) {
        variety = body.split('Variety')[1];
      } else {
        return ['Unknown'];
      }
      variety = variety.replaceAll('</strong>', '');
      variety = variety.replaceAll('</span>', '');
      variety = variety.replaceAll('<span>', '');
      variety = variety.replaceAll('<br>', '');
      variety = variety.replaceAll('</td>', '');
      variety = variety.replaceAll('</p>', '');
      variety = variety.replaceAll(
        /<(br|span|p|td) (d|D)ata-mce-fragment=\"1\">/g,
        ''
      );
      variety = variety.replaceAll(
        /<(td|span) style=\"(font-weight|width): \d+.?\d+%?;\" data-mce-fragment=\"1\" data-mce-style=\"(font-weight|width): \d+.?\d+%?;\">/g,
        ''
      );
      variety = variety.replace(/<span style=\"font-weight: 400;\">/, '');
      variety = variety.replace(
        /<span style=\"font-weight: 400;\" data-mce-style=\"font-weight: 400;\">/,
        ''
      );
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
        if (variant.title.includes('g')) {
          return Number(variant.title.split('g')[0]);
        } else if (variant.title.includes('kg')) {
          return Number(variant.title.split('kg')[0]) * gramsToKg;
        }
      }
    }
    if (item.variants[0].title.includes('g')) {
      return Number(item.variants[0].title.split('g')[0]);
    } else if (item.variants[0].title.includes('kg')) {
      return Number(item.variants[0].title.split('kg')[0]) * gramsToKg;
    }
    return 0;
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    if (item.title.includes(' | ')) {
      return item.title.split(' | ')[1].trim();
    }
    return item.title;
  };
}
