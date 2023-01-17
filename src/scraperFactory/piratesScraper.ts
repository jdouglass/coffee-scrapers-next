import { ProcessCategory } from '../enums/processCategory';
import { IShopifyImage } from '../interfaces/shopify/shopifyImage';
import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData';
import { IShopifyVariant } from '../interfaces/shopify/shopifyVariant';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';

export default class PiratesScraper implements IShopifyScraper {
  getBrand = (item: IShopifyProductResponseData): string => {
    return item.vendor;
  };

  getContinent = (country: string): string => {
    const continent: string | undefined = worldData.get(country);
    if (!continent) {
      return 'Unknown';
    }
    return continent;
  };

  getCountry = (item: IShopifyProductResponseData): string => {
    let reportBody: string;
    if (item.body_html.includes('Single ')) {
      reportBody = item.body_html.split('Single ')[1];
    } else {
      reportBody = item.body_html.split('Origin:')[1];
    }
    reportBody = reportBody.split('<')[0];
    const country: string = 'Unknown';
    const countryList = worldData.keys();
    for (const name of countryList) {
      if (item.title.includes(name) || reportBody.includes(name)) {
        return name;
      }
    }
    return country;
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
    let process: string = item.body_html.split('Process:')[1];
    const processOptions: string[] = process.split('<');
    process = processOptions[0].trim();
    return Helper.convertToUniversalProcess(process);
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
    return baseUrl + '/collections/coffee/products/' + item.handle;
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
    const body: string = item.body_html;
    if (body.includes('Varietal:')) {
      variety = body.split('Varietal:')[1];
    } else if (body.includes('Variety:')) {
      variety = body.split('Variety:')[1];
    } else {
      return ['Unknown'];
    }
    let varietyOptions: string[] = variety.split('<');
    variety = varietyOptions[0].trim();
    variety = variety.replaceAll(/\(.*\)/g, '').trim();
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
        return variant.grams;
      }
    }
    return item.variants[0].grams;
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    let title = item.title;
    title = title.split(':')[0];
    const titleOptions = title.split(' ');
    return Helper.firstLetterUppercase(titleOptions).join(' ');
  };
}
