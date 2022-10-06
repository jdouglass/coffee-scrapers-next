import { ProcessCategory } from '../enums/processCategory';
import { IImage } from '../interfaces/image';
import { IProductResponseData } from '../interfaces/productResponseData';
import { IVariant } from '../interfaces/variant';
import { IScraper } from './abstractScraper';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';

export default class RogueWaveScraper implements IScraper {
  getContinent = (country: string): string => {
    const continent: string | undefined = worldData.get(country);
    if (!continent) {
      return 'Unknown';
    }
    return continent;
  };

  getCountry = (item: IProductResponseData): string => {
    let reportBody = item.body_html;
    if (reportBody.includes('Origin:')) {
      reportBody = reportBody.split('Origin:')[1];
    } else if (reportBody.includes('Origin</strong>:')) {
      reportBody = reportBody.split('Origin</strong>:')[1];
    } else if (reportBody.includes('Region:</strong>')) {
      reportBody = reportBody.split('Region:</strong>')[1];
    } else {
      return 'Unknown';
    }
    reportBody = reportBody.replace('</strong>', '');
    reportBody = reportBody.split('<')[0].trim();
    if (reportBody.includes(', ')) {
      reportBody = reportBody.split(', ')[reportBody.split(', ').length - 1];
    }
    return reportBody;
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
    let process: string = 'Unknown';
    if (body.includes('Process:')) {
      process = body.split('Process:')[1];
      process = process.replace('</strong>', '');
      process = process.replace('&nbsp;', '');
    } else if (body.includes('Process</strong>:')) {
      process = body.split('Process</strong>')[1];
    } else {
      return process;
    }
    process = process.split('<')[0].trim();
    if (process.includes(' + ')) {
      let processOptions: string[] = process.split(' + ');
      process = processOptions.join(', ');
    }
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
    if (body.includes('Variety:')) {
      variety = body.split('Variety:')[1];
      variety = variety.replace('</strong>', '');
      variety = variety.replace('</b>', '');
    } else if (body.includes('Varieties:')) {
      variety = body.split('Varieties:')[1];
      variety = variety.replace('</strong>', '');
    } else if (body.includes('Variety</strong>:')) {
      variety = body.split('Variety</strong>:')[1];
    } else if (body.includes('Varieties</strong>:')) {
      variety = body.split('Varieties</strong>:')[1];
    } else {
      return ['Unknown'];
    }
    variety = variety.split('<')[0];
    variety = variety.replace(/\(.*\)/, '').trim();
    variety = variety.replaceAll(/\s+/g, ' ');
    let varietyOptions: string[];
    if (variety.includes(',')) {
      varietyOptions = variety.split(', ');
    } else if (variety.includes(' and ')) {
      varietyOptions = variety.split(' and ');
    } else if (variety.includes(' + ')) {
      varietyOptions = variety.split(' + ');
    } else {
      varietyOptions = [variety];
    }
    for (let i = 0; i < varietyOptions.length; i++) {
      varietyOptions[i] = varietyOptions[i].replaceAll(/.*\% /g, '');
    }
    varietyOptions = Helper.firstLetterUppercase(varietyOptions);
    varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
    varietyOptions = Array.from([...new Set(varietyOptions)]);
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
    title = title.split('-')[1];
    title = title.split('|')[0];
    return title.trim();
  };
}
