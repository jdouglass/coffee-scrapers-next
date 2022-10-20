import { ProcessCategory } from '../enums/processCategory';
import { IImage } from '../interfaces/image';
import { IProductResponseData } from '../interfaces/productResponseData';
import { IVariant } from '../interfaces/variant';
import { IScraper } from '../interfaces/scraper';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';
import { brands } from '../data/brands';

export default class RevolverScraper implements IScraper {
  getBrand = (item: IProductResponseData): string => {
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

  getCountry = (item: IProductResponseData): string => {
    let reportBody: string = item.body_html.split('From')[0];
    reportBody = reportBody.toLowerCase();
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

  getProcess = (item: IProductResponseData): string => {
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
    if (item.title.includes('Instrumental')) {
      return ['Caturra', 'Castillo', 'Colombia'];
    } else if (item.title.includes('Rootbeer')) {
      return ['Parainema'];
    }
    let variety: string;
    let body = item.body_html;
    if (body.includes('Varietal:')) {
      variety = body.split('Varietal:')[1];
    } else if (body.includes('Variety:')) {
      variety = body.split('Variety:')[1];
    } else if (body.includes('Varieties:')) {
      variety = body.split('Varieties:')[1];
    } else if (body.includes('Varieites')) {
      variety = body.split('Varieites:')[1];
    } else {
      return ['Unknown'];
    }
    let varietyOptions: string[] = variety.split('<');
    variety = varietyOptions[0].trim();
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

  getTitle = (title: string, brand?: string, country?: string): string => {
    title = title.split(brand as string)[1];
    title = title.split('*')[0];
    if (title.includes(country as string)) {
      title = title.replace(country as string, '');
    }
    if (title.includes('"')) {
      title = title.replaceAll('"', '');
    }
    if (title.includes("'")) {
      title = title.replaceAll("'", '');
    }
    if (title.includes('(')) {
      title = title.replaceAll('(', '');
    }
    if (title.includes(')')) {
      title = title.replaceAll(')', '');
    }
    title = title.replaceAll(/\s+/g, ' ').trim();
    return title;
  };
}