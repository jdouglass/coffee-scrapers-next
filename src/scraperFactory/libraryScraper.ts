import { ProcessCategory } from '../enums/processCategory';
import { IShopifyImage } from '../interfaces/shopify/shopifyImage';
import { IShopifyProductResponseData } from '../interfaces/shopifyResponseData';
import { IShopifyVariant } from '../interfaces/shopifyVariant';
import { IShopifyScraper } from '../interfaces/shopifyScraper';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';

export default class LibraryScraper implements IShopifyScraper {
  getContinent = (country: string): string => {
    const continent: string | undefined = worldData.get(country);
    if (!continent) {
      return 'Unknown';
    }
    return continent;
  };

  getCountry = (item: IShopifyProductResponseData): string => {
    let country = item.title
      .split(' - ')
      [item.title.split(' - ').length - 1].trim();
    country = Helper.firstLetterUppercase([country]).toString();
    if (worldData.has(country)) {
      return country;
    }
    return 'Unknown';
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
    if (item.body_html.includes('Processing:')) {
      let process: string = item.body_html.split('Processing:')[1];
      process = process.split('<')[0].trim();
      return Helper.convertToUniversalProcess(process);
    }
    return 'Unknown';
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
    for (const variant of item.variants) {
      if (variant.available) {
        return (
          baseUrl +
          '/collections/frontpage/products/' +
          item.handle +
          '?variant=' +
          variant.id.toString()
        );
      }
    }
    return (
      baseUrl +
      '/collections/frontpage/products/' +
      item.handle +
      '?variant=' +
      item.variants[0].id.toString()
    );
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
      variety = variety.split('<')[0].trim();
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
    if (item.title.includes(' - ') && this.getCountry(item) !== 'Unknown') {
      const titleElements: string[] = item.title.split(' - ');
      titleElements.pop();
      return titleElements.join(' - ');
    }
    return item.title;
  };
}
