import { ProcessCategory } from '../enums/processCategory';
import { IShopifyImage } from '../interfaces/shopify/shopifyImage';
import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData';
import { IShopifyVariant } from '../interfaces/shopify/shopifyVariant';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';

export default class SorellinaScraper implements IShopifyScraper {
  getContinent = (country: string): string => {
    const continent: string | undefined = worldData.get(country);
    if (!continent) {
      return 'Unknown';
    }
    return continent;
  };

  getCountry = (item: IShopifyProductResponseData): string => {
    const defaultCountry = 'Unknown';
    for (const [country, continent] of worldData) {
      if (item.title.includes(country)) {
        return country;
      }
    }
    return defaultCountry;
  };

  getDateAdded = (date: string): string => {
    return new Date(date).toISOString();
  };

  getHandle = (handle: string): string => {
    return handle;
  };

  getImageUrl = (images: IShopifyImage[]) => {
    if (images.length !== 0) {
      return images[0].src;
    }
    return 'https://via.placeholder.com/300x280.webp?text=No+Image+Available';
  };

  getPrice = (variants: IShopifyVariant[]): number => {
    const price: any = variants.map((variant) => {
      if (variant.available) {
        return Number(Number(variant.price).toFixed(2));
      }
    });
    if (!price) {
      return Number(Number(variants[0].price).toFixed(2));
    }
    return Number(Number(variants[0].price).toFixed(2));
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
      process = process.replaceAll(
        /<(br|span) (d|D)ata-mce-fragment=\"1\">/g,
        ''
      );
      process = process.split(':')[1].trim();
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

  getProcessCategory = (process: string): string => {
    if (
      process === ProcessCategory[ProcessCategory.Washed] ||
      process === ProcessCategory[ProcessCategory.Natural] ||
      process === ProcessCategory[ProcessCategory.Honey] ||
      process === ProcessCategory[ProcessCategory.Unknown]
    ) {
      return process;
    }
    return ProcessCategory[ProcessCategory.Experimental];
  };

  getProductUrl = (
    item: IShopifyProductResponseData,
    baseUrl: string
  ): string => {
    return baseUrl + '/collections/beans/products/' + item.handle;
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
    try {
      let variety: string;
      const body: string = item.body_html;
      if (body.includes('Variet')) {
        variety = body.split('Variet')[1];
      } else {
        return ['Unknown'];
      }
      variety = variety.replaceAll('</strong>', '');
      variety = variety.replaceAll('</span>', '');
      variety = variety.replaceAll('<span>', '');
      variety = variety.replaceAll('<br>', '');
      variety = variety.replaceAll(
        /<(br|span|strong) (d|D)ata-mce-fragment=\"1\">/g,
        ''
      );
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
    const poundToGrams = 453.6;
    for (const variant of item.variants) {
      if (variant.available) {
        if (variant.title.includes('g')) {
          return Number(variant.title.split('g')[0]);
        } else if (variant.title.includes('lb')) {
          return Number(variant.title.split('lb')[0]) * poundToGrams;
        }
      }
    }
    if (item.variants[0].title.includes('g')) {
      return Number(item.variants[0].title.split('g')[0]);
    } else if (item.variants[0].title.includes('lb')) {
      return Number(item.variants[0].title.split('lb')[0]) * poundToGrams;
    }
    return 0;
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    if (item.title.includes(' - ')) {
      return item.title.split(' - ')[0].trim();
    }
    return item.title;
  };
}
