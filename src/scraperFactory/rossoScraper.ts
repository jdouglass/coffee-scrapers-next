import { ProcessCategory } from '../enums/processCategory';
import { IShopifyImage } from '../interfaces/shopify/shopifyImage';
import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData';
import { IShopifyVariant } from '../interfaces/shopify/shopifyVariant';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';

export default class RossoScraper implements IShopifyScraper {
  getContinent = (country: string): string => {
    const continent: string | undefined = worldData.get(country);
    if (!continent) {
      return 'Unknown';
    }
    return continent;
  };

  getCountry = (item: IShopifyProductResponseData): string => {
    let reportBody: string = item.body_html.split('Geography')[1];
    reportBody = reportBody.replace(/<.*>\n.*\n<.*">/, '');
    reportBody = reportBody.split('<')[0];
    const georgraphy: string[] = reportBody.split(', ');
    return georgraphy[georgraphy.length - 1];
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
    let process: string = item.body_html.split('Process')[1];
    process = process.replace(/<.*>\n.*<.*">/, '');
    process = process.split('<')[0];
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
    const body = item.body_html;
    if (body.includes('Varietal')) {
      variety = body.split('Varietal')[1];
      variety = variety.split('Process')[0];
    } else {
      return ['Unknown'];
    }
    variety = variety.replace(/<.*>\n.*<.*">/, '');
    variety = variety.replaceAll(/<.*>\n.*<.*">/g, ', ');
    variety = variety.split('<')[0];
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
    const title = item.title;
    if (title.includes('???')) {
      return title.split('???')[0];
    }
    return title;
  };
}
