import { ShopifyBaseScraper } from '../baseScrapers/shopifyBaseScraper';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';
import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData.interface';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper.interface';

export default class PopCoffeeWorksScraper
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
    if (!countryList.size) {
      if (item.body_html.includes('>Region')) {
        country = item.body_html.split('>Region')[1].trim();
      }
      if (country !== '') {
        country = country
          .replace(
            '<div class="contents" data-label="Region" data-mce-fragment="1">',
            ''
          )
          .trim();
        country = country.replace('</strong>', '').trim();
        country = country.replace('</div>', '').trim();
        country = country.replace('<div>', '').trim();
        country = country.split('<')[0].trim();
        for (const location of worldData.keys()) {
          if (country.toLowerCase().includes(location.toLowerCase())) {
            countryList.add(location);
          }
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

    if (item.body_html.includes('>Process')) {
      process = item.body_html.split('>Process')[1].trim();
    }

    if (process !== '') {
      process = process
        .replace(
          '<div class="contents" data-label="Process" data-mce-fragment="1">',
          ''
        )
        .trim();
      process = process.replace('</strong>', '').trim();
      process = process.replaceAll('</div>', '').trim();
      process = process.replace('<div>', '').trim();
      process = process.replace('<span>', '').trim();
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
    return baseUrl + '/products/' + item.handle;
  };

  getVariety = (item: IShopifyProductResponseData): string[] => {
    let variety = '';
    const body = item.body_html;
    if (body.includes('>Variety')) {
      variety = body.split('>Variety')[1];
    } else {
      return ['Unknown'];
    }
    if (variety !== '') {
      variety = variety
        .replace(
          '<div class="contents" data-label="Variety" data-mce-fragment="1">',
          ''
        )
        .trim();
      variety = variety.replace('</strong>', '').trim();
      variety = variety.replace('</div>', '').trim();
      variety = variety.replace('<div>', '').trim();
      variety = variety.replace('<span>', '').trim();
      variety = variety.split('<')[0].trim();
      variety = variety.replaceAll('&amp;', ', ');
      variety = variety.replaceAll('and', ', ');
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
    return varietyOptions;
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    for (const location of worldData.keys()) {
      if (item.title.includes(location)) {
        item.title = item.title.replace(location, '').trim();
      }
    }
    return Helper.firstLetterUppercase([item.title]).join(' ');
  };

  getWeight = (item: IShopifyProductResponseData): number => {
    const poundToGrams = 453.6;
    const defaultWeight = 225;
    for (const variant of item.variants) {
      if (variant.available) {
        if (variant.title.includes('/')) {
          variant.title = variant.title.split('/')[1].trim();
        }
        if (variant.title.includes('g')) {
          return Number(variant.title.split('g')[0].trim());
        } else if (variant.title.includes('lb')) {
          const weightStr = variant.title.split('lb')[0].trim();
          return Math.round(Number(weightStr) * poundToGrams);
        }
      }
    }
    if (item.variants[0].title.includes('/')) {
      item.variants[0].title = item.variants[0].title.split('/')[1].trim();
    }
    if (item.variants[0].title.includes('g')) {
      return Number(item.variants[0].title.split('g')[0].trim());
    } else if (item.variants[0].title.includes('lb')) {
      const weightStr = item.variants[0].title.split('lb')[0].trim();
      return Math.round(Number(weightStr) * poundToGrams);
    }
    return item.variants[0].grams ? item.variants[0].grams : defaultWeight;
  };
}
