import { ShopifyBaseScraper } from '../baseScrapers/shopifyBaseScraper';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';
import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData.interface';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper.interface';

export default class SamJamesScraper
  extends ShopifyBaseScraper
  implements IShopifyScraper
{
  getCountry = (item: IShopifyProductResponseData): string => {
    const countryList = new Set<string>();
    for (const location of worldData.keys()) {
      if (item.title.toLowerCase().includes(location.toLowerCase())) {
        countryList.add(location);
      }
    }
    if (!countryList.size) {
      for (const location of worldData.keys()) {
        if (item.body_html.toLowerCase().includes(location.toLowerCase())) {
          countryList.add(location);
        }
      }
    }
    if (!countryList.size) {
      return 'Unknown';
    } else if (countryList.size === 1) {
      return countryList.values().next().value as string;
    }
    return 'Multiple';
  };

  getProcess = (item: IShopifyProductResponseData): string => {
    let process = '';

    if (item.body_html.includes('Processing:')) {
      process = item.body_html.split('Processing:')[1].trim();
    }

    if (process !== '') {
      process = process.replace('<span mce-data-marked="1">', '').trim();
      process = process.replaceAll('<span data-mce-fragment="1">', '').trim();
      process = process.replace('<span>', '').trim();
      process = process.replace('</b>', '').trim();
      process = process.replace('</strong>', '').trim();
      process = process.split('<')[0].trim();
      process = process
        .split(/[+\/]/)
        .map((item) => item.trim())
        .join(', ');
      process = Helper.firstLetterUppercase([process]).join();
      if (process !== '') {
        return Helper.convertToUniversalProcess(process);
      }
    }
    return 'Unknown';
  };

  getProductUrl = (
    item: IShopifyProductResponseData,
    baseUrl: string
  ): string => {
    return baseUrl + '/collections/beans/products/' + item.handle;
  };

  getVariety = (item: IShopifyProductResponseData): string[] => {
    let variety = '';
    const body = item.body_html;
    if (body.includes('Varietal:')) {
      variety = body.split('Varietal:')[1];
    } else if (body.includes('VARIETY:')) {
      variety = body.split('VARIETY:')[1];
    } else {
      return ['Unknown'];
    }
    if (variety !== '') {
      variety = variety
        .replace('<span data-preserver-spaces="true">', '')
        .trim();
      variety = variety.replaceAll('<meta charset="utf-8">', '').trim();
      variety = variety.replace('<span data-mce-fragment="1">', '').trim();
      variety = variety.replace('<span>', '').trim();
      variety = variety.replace('</span>', '').trim();
      variety = variety.replace('<span mce-data-marked="1">', '').trim();
      variety = variety.replace('</strong>', '').trim();
      variety = variety.replace('</b>', '').trim();
      variety = variety.split('<')[0].trim();
      variety = variety.replaceAll('&amp;', ', ');
      variety = variety
        .split(/[+\/\&]/)
        .map((item) => item.trim())
        .join(', ');
      variety = Helper.firstLetterUppercase([variety]).join();
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
    if (varietyOptions.length && varietyOptions[0] !== '') {
      return varietyOptions;
    }
    return ['Unknown'];
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    return Helper.firstLetterUppercase([item.title]).join(' ');
  };
}
