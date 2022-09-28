import { ProcessCategory } from '../enums/processCategory';
import { IImage } from '../interfaces/image';
import { IProductResponseData } from '../interfaces/productResponseData';
import { IVariant } from '../interfaces/variant';
import { IScraper } from './abstractScraper';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';

export default class MonogramScraper implements IScraper {
  getBrand = (item: IProductResponseData): string => {
    if (item.title.includes('Atlas')) {
      const titleOptions: string[] = item.title.split('-');
      return titleOptions[1].trim();
    }
    return 'Monogram';
  };

  getContinent = (country: string): string => {
    const continent: string | undefined = worldData.get(country);
    if (!continent) {
      return 'Unknown';
    }
    return continent;
  };

  getCountry = (item: IProductResponseData): string => {
    let country: string;
    if (item.body_html.includes('ORIGIN:')) {
      country = item.body_html.split('ORIGIN:')[1];
    } else if (item.body_html.includes('Origin:')) {
      country = item.body_html.split('Origin:')[1];
    } else {
      return 'Unknown';
    }
    country = country
      .replace('<meta charset="utf-8">', '')
      .split('<')[0]
      .trim();
    if (country.includes(', ')) {
      const countryOptions = country.split(', ');
      country = countryOptions[countryOptions.length - 1].trim();
    }
    if (country === 'TIMOR-LESTE') {
      return 'Timor-Leste';
    }
    return Helper.firstLetterUppercase([country]).join(' ');
  };

  getDateAdded = (date: string): string => {
    return new Date(date).toISOString();
  };

  getHandle = (handle: string): string => {
    return handle;
  };

  getImageUrl = (images: IImage[]) => {
    return images[0].src;
  };

  getPrice = (variants: IVariant[]): string => {
    const price: any = variants.map((variant) => {
      if (variant.available) {
        return variant.price;
      }
    });
    if (!price) {
      return variants[0].price;
    }
    return variants[0].price;
  };

  getProcess = (body: string): string => {
    let process: string;
    if (body.includes('PROCESS:')) {
      process = body.split('PROCESS:')[1];
    } else if (body.includes('Process:')) {
      process = body.split('Process:')[1];
    } else {
      process = body.split('Processing:')[1];
    }
    process = process.replace('<span>', '');
    const processOptions: string[] = process.split('<');
    process = processOptions[0].trim();
    return Helper.firstLetterUppercase(process.split(' ')).join(' ');
  };

  getProcessCategory = (process: string): string => {
    if (process === 'Washed' || process === 'Natural' || process === 'Honey') {
      return process;
    }
    return ProcessCategory[ProcessCategory.Experimental];
  };

  getProductUrl = (item: IProductResponseData, baseUrl: string): string => {
    return (
      baseUrl +
      '/products/' +
      item.handle +
      '?variant=' +
      item.variants[0].id.toString()
    );
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

  getVariety = (body: string): string[] => {
    let variety: string;
    if (body.includes('VARIETY:')) {
      variety = body.split('VARIETY:')[1];
    } else if (body.includes('Variety:')) {
      variety = body.split('Variety:')[1];
    } else {
      return ['Unknown'];
    }
    variety = variety.replace('<meta charset="utf-8">', '');
    let varietyOptions: string[] = variety.split('<');
    variety = varietyOptions[0].trim();
    if (variety.includes(', ')) {
      varietyOptions = variety.split(', ');
    } else {
      varietyOptions = [variety];
    }
    varietyOptions = Helper.firstLetterUppercase(varietyOptions);
    varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
    return varietyOptions;
  };

  getWeight = (variants: IVariant[]): number => {
    for (const variant of variants) {
      if (variant.available) {
        return variant.grams;
      }
    }
    return variants[0].grams;
  };

  getTitle = (title: string): string => {
    let titleOptions: string[];
    if (title.includes('Atlas')) {
      titleOptions = title.split('-');
      return titleOptions[titleOptions.length - 1].trim();
    }

    const titleResult: string = title.split('-')[0];
    titleOptions = titleResult.split('*');
    if (titleOptions.length > 1) {
      return titleResult[titleResult.length - 1].trim();
    }
    return titleOptions.toString().trim();
  };
}
