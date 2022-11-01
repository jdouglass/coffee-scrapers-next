import { ProcessCategory } from '../enums/processCategory';
import { IImage } from '../interfaces/image';
import { IProductResponseData } from '../interfaces/productResponseData';
import { IVariant } from '../interfaces/variant';
import { IScraper } from '../interfaces/scraper';
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
    if (images.length !== 0) {
      return images[0].src;
    }
    return 'https://via.placeholder.com/300x280.webp?text=No+Image+Available';
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

  getProcess = (item: IProductResponseData): string => {
    let process: string;
    if (item.body_html.includes('PROCESS:')) {
      process = item.body_html.split('PROCESS:')[1];
    } else if (item.body_html.includes('Process:')) {
      process = item.body_html.split('Process:')[1];
    } else {
      process = item.body_html.split('Processing:')[1];
    }
    process = process.replace('<span>', '');
    const processOptions: string[] = process.split('<');
    process = processOptions[0].trim();
    return Helper.firstLetterUppercase(process.split(' ')).join(' ');
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

  getVariety = (item: IProductResponseData): string[] => {
    let variety: string;
    let body: string = item.body_html;
    if (body.includes('VARIETY:')) {
      variety = body.split('VARIETY:')[1];
    } else if (body.includes('Variety:')) {
      variety = body.split('Variety:')[1];
    } else {
      return ['Unknown'];
    }
    variety = variety.replace('<meta charset="utf-8">', '');
    variety = variety.replace('<span data-mce-fragment="1">', '');
    variety = variety.replace('</span>', '');
    let varietyOptions: string[] = variety.split('<');
    variety = varietyOptions[0].trim();
    if (variety.includes(', ')) {
      varietyOptions = variety
        .split(', ')
        .map((variety: string) => variety.trim());
    } else {
      varietyOptions = [variety];
    }
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
