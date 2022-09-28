import { ProcessCategory } from '../enums/processCategory';
import { IImage } from '../interfaces/image';
import { IProductResponseData } from '../interfaces/productResponseData';
import { IVariant } from '../interfaces/variant';
import { IScraper } from './abstractScraper';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';

export default class PiratesScraper implements IScraper {
  getBrand = (item: IProductResponseData): string => {
    return item.vendor;
  };

  getContinent = (country: string): string => {
    const continent: string | undefined = worldData.get(country);
    if (!continent) {
      return 'Unknown';
    }
    return continent;
  };

  getCountry = (item: IProductResponseData): string => {
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
    let process: string = body.split('Process:')[1];
    const processOptions: string[] = process.split('<');
    process = processOptions[0].trim();
    return Helper.convertToUniversalProcess(process);
  };

  getProcessCategory = (process: string): string => {
    if (process === 'Washed' || process === 'Natural' || process === 'Honey') {
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

  getVariety = (body: string): string[] => {
    let variety: string;
    if (body.includes('Varietal:')) {
      variety = body.split('Varietal:')[1];
    } else if (body.includes('Variety:')) {
      variety = body.split('Variety:')[1];
    } else {
      return ['Unknown'];
    }
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
    title = title.split(':')[0];
    const titleOptions = title.split(' ');
    return Helper.firstLetterUppercase(titleOptions).join(' ');
  };
}
