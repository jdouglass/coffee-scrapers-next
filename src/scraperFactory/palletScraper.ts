import { ProcessCategory } from '../enums/processCategory';
import { IImage } from '../interfaces/image';
import { IProductResponseData } from '../interfaces/productResponseData';
import { IVariant } from '../interfaces/variant';
import { IScraper } from '../interfaces/scraper';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';

export default class PalletScraper implements IScraper {
  getContinent = (country: string): string => {
    const continent: string | undefined = worldData.get(country);
    if (!continent) {
      return 'Unknown';
    }
    return continent;
  };

  getCountry = (item: IProductResponseData): string => {
    if (item.body_html.includes('Origin')) {
      let country = item.body_html.split('Origin')[1];
      country = country.split(/\s-\s/)[1];
      return country.split('<')[0].trim();
    }
    if (
      item.body_html.includes('Blend breakdown') ||
      item.body_html.includes('Blend Breakdown')
    ) {
      return 'Multiple';
    }
    return 'Unknown';
  };

  getDateAdded = (date: string): string => {
    return new Date(date).toISOString();
  };

  getHandle = (handle: string): string => {
    return handle;
  };

  getImageUrl = (images: IImage[]) => {
    if (images.length !== 0) {
      return images[0].src;
    }
    return 'https://via.placeholder.com/300x280.webp?text=No+Image+Available';
  };

  getPrice = (variants: IVariant[]): number => {
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

  getProcess = (item: IProductResponseData): string => {
    if (item.body_html.includes('Process')) {
      let process: string = item.body_html.split(/Process.*-/)[1];
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

  getProductUrl = (item: IProductResponseData, baseUrl: string): string => {
    return baseUrl + '/collections/coffee/products/' + item.handle;
  };

  getSoldOut = (variants: IVariant[]): boolean => {
    let isAvailable = true;
    for (const variant of variants) {
      if (variant.available) {
        isAvailable = false;
      }
    }
    return isAvailable;
  };

  getVariety = (item: IProductResponseData): string[] => {
    let variety: string = '';
    if (item.body_html.includes('Varietal')) {
      variety = item.body_html.split('Varietal')[1];
      variety = variety.split(/\s?-\s/)[1];
      variety = variety.split('<')[0].trim();
    } else {
      return ['Unknown'];
    }
    let varietyOptions = variety
      .split(/, | & | &amp; /)
      .map((variety: string) => variety.trim());
    varietyOptions = Helper.firstLetterUppercase(varietyOptions);
    varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
    varietyOptions = Array.from([...new Set(varietyOptions)]);
    return varietyOptions;
  };

  getWeight = (item: IProductResponseData): number => {
    for (const variant of item.variants) {
      if (variant.available) {
        return variant.grams;
      }
    }
    return item.variants[0].grams;
  };

  getTitle = (item: IProductResponseData): string => {
    if (item.title.includes(' - ')) {
      const titleElements: string[] = item.title.split(' - ');
      titleElements.pop();
      return titleElements.join(' - ');
    }
    return item.title;
  };
}