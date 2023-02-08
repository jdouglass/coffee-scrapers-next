import { ShopifyBaseScraper } from '../baseScrapers/shopifyBaseScraper';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';
import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData.interface';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper.interface';

export default class HouseOfFunkScraper
  extends ShopifyBaseScraper
  implements IShopifyScraper
{
  getCountry = (item: IShopifyProductResponseData): string => {
    let country = '';
    const countryList = new Set<string>();
    for (const location of worldData.keys()) {
      if (item.title.toLowerCase().includes(location.toLowerCase())) {
        countryList.add(location);
      }
    }
    if (!countryList.size && item.body_html.includes('Origin')) {
      country = item.body_html.split('Origin')[1].trim();
      country = country.split(':')[1].trim();
      country = country.split('<')[0].trim();
      if (country !== '') {
        for (const location of worldData.keys()) {
          if (country.toLowerCase().includes(location.toLowerCase())) {
            countryList.add(location);
          }
        }
      }
    }
    if (countryList.size === 1) {
      return countryList.values().next().value as string;
    } else if (countryList.size > 1) {
      return 'Multiple';
    }
    return 'Unknown';
  };

  getProcess = (item: IShopifyProductResponseData): string => {
    let process = '';
    if (item.body_html.includes('Process')) {
      process = item.body_html.split('Process')[1].trim();
      if (process.includes(':')) {
        process = process.split(':')[1].trim();
      } else if (process.includes('/')) {
        process = process.split('/')[1].trim();
      }
      process = process.replace('</span>', '');
      process = process.replace('<span class="JsGRdQ">', '');
      process = process.split('<')[0].trim();
      process = process
        .split(/[+\/]/)
        .map((item) => item.trim())
        .join(', ');
      process = Helper.firstLetterUppercase([process]).join();
      return Helper.convertToUniversalProcess(process);
    }
    return 'Unknown';
  };

  getProductUrl = (
    item: IShopifyProductResponseData,
    baseUrl: string
  ): string => {
    return baseUrl + '/collections/coffee/products/' + item.handle;
  };

  getVariety = (item: IShopifyProductResponseData): string[] => {
    let variety = '';
    const body = item.body_html;
    if (body.includes('Variet')) {
      variety = body.split('Variet')[1];
    } else if (body.includes('Varit')) {
      variety = body.split('Varit')[1];
    } else {
      return ['Unknown'];
    }
    if (variety !== '') {
      if (variety.includes(':')) {
        variety = variety.split(':')[1].trim();
      } else if (variety.includes('/')) {
        variety = variety.split('/')[1].trim();
      }
      variety = variety.replace('</span>', '');
      variety = variety.replace('<span class="JsGRdQ">', '');
      variety = variety.split('<')[0].trim();
      variety = variety.replaceAll('&amp;', ', ');
      variety = variety.replaceAll('and', ', ');
      variety = variety
        .split(/[+\/\&]/)
        .map((item) => item.trim())
        .join(', ');
      variety = Helper.firstLetterUppercase([variety]).join();
    } else {
      return ['Unknown'];
    }
    let varietyOptions: string[];
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

  getTitle = (item: IShopifyProductResponseData): string => {
    if (item.title.includes('/')) {
      return Helper.firstLetterUppercase([
        item.title.split('/')[0].trim(),
      ]).join();
    }
    return Helper.firstLetterUppercase([item.title]).join();
  };

  getWeight = (item: IShopifyProductResponseData): number => {
    const poundToGrams = 453.6;
    for (const variant of item.variants) {
      if (variant.available) {
        if (variant.title.includes('G')) {
          return Number(variant.title.split('G')[0].trim());
        } else if (variant.title.includes('LB')) {
          const weightStr = variant.title.split('LB')[0].trim();
          return Math.round(Number(weightStr) * poundToGrams);
        }
      }
    }
    if (item.variants[0].title.includes('G')) {
      return Number(item.variants[0].title.split('G')[0].trim());
    } else if (item.variants[0].title.includes('LB')) {
      const weightStr = item.variants[0].title.split('LB')[0].trim();
      return Math.round(Number(weightStr) * poundToGrams);
    }
    return item.variants[0].grams;
  };
}
