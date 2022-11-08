import { ProcessCategory } from '../enums/processCategory';
import { IShopifyImage } from '../interfaces/shopify/shopifyImage';
import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData';
import { IShopifyVariant } from '../interfaces/shopify/shopifyVariant';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';
import { brands } from '../data/brands';

export default class EightOunceScraper implements IShopifyScraper {
  getBrand = (item: IShopifyProductResponseData): string => {
    for (const brand of brands) {
      if (item.title.includes(brand)) {
        return brand;
      }
    }
    return 'Unknown';
  };

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
    let country = '';
    if (item.body_html.includes('Origin:')) {
      country = item.body_html.split('Origin:')[1];
    } else if (item.body_html.includes('Region:')) {
      country = item.body_html.split('Region:')[1];
    }
    country = country.split('<')[0].trim();
    if (country.includes(', ')) {
      const locations = country.split(', ');
      country = locations[locations.length - 1].trim();
    }
    if (country !== '') {
      return country;
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
      let process: string;
      if (item.body_html.includes('PROCESS')) {
        process = item.body_html.split('PROCESS')[1];
      } else if (item.body_html.includes('Process')) {
        process = item.body_html.split('Process')[1];
      } else if (item.body_html.includes('BEANS')) {
        process = item.body_html.split('BEANS')[1];
        process = process.split(', ')[0];
      } else {
        return defaultProcess;
      }
      process = process.replace('</strong>', '');
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
      if (process.includes('.')) {
        process = process.split('.')[0];
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
    try {
      let variety: string;
      const body: string = item.body_html;
      if (body.includes('VARIET')) {
        variety = body.split('VARIET')[1];
      } else if (body.includes('Variet')) {
        variety = body.split('Variet')[1];
      } else if (body.includes('BEANS')) {
        variety = body.split('BEANS')[1];
        variety = variety.split(', ')[1];
      } else {
        return ['Unknown'];
      }
      variety = variety.replace('</strong>', '');
      variety = variety.split(':')[1].trim();
      variety = variety.split('<')[0].trim();
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
    let bodyWeight: string = '';
    let weight = 0;
    if (
      item.title.includes('(') &&
      (item.title.includes('g') || item.title.includes('G'))
    ) {
      const titleWeight: string =
        item.title.split('(')[item.title.split('(').length - 1];
      if (titleWeight.includes('g')) {
        return Number(titleWeight.split('g')[0].trim());
      }
      return Number(titleWeight.split('G')[0]);
    }
    if (item.body_html.includes('Quantity')) {
      bodyWeight = item.body_html.split('Quantity')[1];
    }
    bodyWeight = bodyWeight.replace('</strong>', '');
    bodyWeight = bodyWeight.split(':')[1].trim();
    if (bodyWeight.includes('g')) {
      bodyWeight = bodyWeight.split('g')[0];
    } else {
      bodyWeight = bodyWeight.split('G')[0];
    }
    weight = Number(bodyWeight.trim());
    if (weight !== 0 && weight !== NaN) {
      return weight;
    }
    for (const variant of item.variants) {
      if (variant.available) {
        return variant.grams;
      }
    }
    if (item.variants[0].grams) {
      return item.variants[0].grams;
    }
    return 0;
  };

  getTitle = (item: IShopifyProductResponseData, brand?: string): string => {
    let title = item.title;
    if (title.includes('-')) {
      title = title.split('-')[1];
    } else {
      title = title.split(brand as string)[1].trim();
    }
    if (title.includes(':')) {
      return title.split(':')[0].trim();
    } else if (title.includes(',')) {
      return title.split(',')[0].trim();
    } else if (title.includes('(')) {
      return title.split('(')[0].trim();
    }
    return title.trim();
  };
}
