import { ProcessCategory } from '../enums/processCategory';
import { IShopifyImage } from '../interfaces/shopify/shopifyImage';
import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData';
import { IShopifyVariant } from '../interfaces/shopify/shopifyVariant';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';

export default class RogueWaveScraper implements IShopifyScraper {
  getContinent = (country: string): string => {
    const continent: string | undefined = worldData.get(country);
    if (!continent) {
      return 'Unknown';
    }
    return continent;
  };

  getCountry = (item: IShopifyProductResponseData): string => {
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
    let process: string = 'Unknown';
    if (item.body_html.includes('Process:')) {
      process = item.body_html.split('Process:')[1];
      process = process.replace('</strong>', '');
      process = process.replace('&nbsp;', '');
    } else if (item.body_html.includes('Process</strong>:')) {
      process = item.body_html.split('Process</strong>')[1];
    } else {
      return process;
    }
    process = process.split('<')[0].trim();
    if (process.includes(' + ')) {
      const processOptions: string[] = process.split(' + ');
      process = processOptions.join(', ');
    }
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
    if (body.includes('Variet')) {
      variety = body.split('Variet')[1];
      variety = variety.split(':')[1];
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
    for (let i = 0; i < varietyOptions.length; i++) {
      varietyOptions[i] = varietyOptions[i].replaceAll(/.*\% /g, '');
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
    title = title.split('-')[1];
    title = title.split('|')[0];
    return title.trim();
  };
}
