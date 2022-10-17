import { ProcessCategory } from '../enums/processCategory';
import { IImage } from '../interfaces/image';
import { IProductResponseData } from '../interfaces/productResponseData';
import { IVariant } from '../interfaces/variant';
import { IScraper } from './abstractScraper';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';

export default class RossoScraper implements IScraper {
  getContinent = (country: string): string => {
    const continent: string | undefined = worldData.get(country);
    if (!continent) {
      return 'Unknown';
    }
    return continent;
  };

  getCountry = (item: IProductResponseData): string => {
    let reportBody: string = item.body_html.split('Geography')[1];
    reportBody = reportBody.replace(/<.*>\n.*\n<.*">/, '');
    reportBody = reportBody.split('<')[0];
    let georgraphy: string[] = reportBody.split(', ');
    return georgraphy[georgraphy.length - 1];
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
    let process: string = item.body_html.split('Process')[1];
    process = process.replace(/<.*>\n.*<.*">/, '');
    process = process.split('<')[0];
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

  getVariety = (item: IProductResponseData): string[] => {
    let variety: string;
    let body = item.body_html;
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

  getWeight = (item: IProductResponseData): number => {
    for (const variant of item.variants) {
      if (variant.available) {
        return variant.grams;
      }
    }
    return item.variants[0].grams;
  };

  getTitle = (title: string): string => {
    if (title.includes('—')) {
      return title.split('—')[0];
    }
    return title;
  };
}
