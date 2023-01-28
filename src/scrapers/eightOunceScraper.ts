import { ProcessCategory } from '../enums/processCategory';
import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData.interface';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper.interface';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';
import { brands } from '../data/brands';
import { BaseUrl } from '../enums/baseUrls';
import { ShopifyBaseScraper } from '../baseScrapers/shopifyBaseScraper';
import { EightOunceHelper } from '../helper/eightOunceHelper';

export default class EightOunceScraper
  extends ShopifyBaseScraper
  implements IShopifyScraper
{
  getBrand = (item: IShopifyProductResponseData): string => {
    let possibleBrand = '';
    if (item.title.includes(' - ')) {
      possibleBrand = item.title.split(' - ')[0];
    }
    if (possibleBrand !== '') {
      for (const brand of brands) {
        if (possibleBrand.includes(brand)) {
          return Helper.convertToUniversalBrand(brand);
        }
      }
    }
    for (const brand of brands) {
      if (item.title.includes(brand)) {
        return Helper.convertToUniversalBrand(brand);
      }
    }
    return 'Unknown';
  };

  getCountry = async (item: IShopifyProductResponseData): Promise<string> => {
    const defaultCountry = 'Unknown';
    for (const country of worldData.keys()) {
      if (item.title.includes(country)) {
        return country;
      }
    }
    let country = '';
    if (item.body_html.includes('Origin:')) {
      country = item.body_html.split('Origin:')[1];
    } else if (item.body_html.includes('Region:')) {
      country = item.body_html.split('Region:')[1];
    }
    country = country.split('<')[0].trim();
    if (country.includes(', ')) {
      const locations = country.split(', ');
      country = locations[locations.length - 1].trim();
    }
    if (country !== '') {
      return country;
    } else {
      const bodyText = await EightOunceHelper.getProductInfo(
        this.getProductUrl(item, BaseUrl.EightOunce)
      );
      if (bodyText.length !== 0) {
        for (const detail of bodyText) {
          if (detail?.includes('Origin:')) {
            if (detail?.includes('Blend')) {
              return 'Multiple';
            }
            for (const country of worldData.keys()) {
              if (detail?.includes(country)) {
                return country;
              }
            }
          }
        }
      }
    }
    return defaultCountry;
  };

  getProcess = async (item: IShopifyProductResponseData): Promise<string> => {
    const defaultProcess = 'Unknown';
    const maxProcessLength = 75;
    let process = '';
    const foundProcessFromTitle = item.title.match(/:.*,/);
    if (item.body_html.includes('\nProcess')) {
      process = item.body_html.split('Process')[1];
      process = process.split('\n')[0].trim();
    } else {
      if (item.body_html.includes('PROCESS')) {
        process = item.body_html.split('PROCESS')[1];
      } else if (item.body_html.includes('Process')) {
        process = item.body_html.split('Process')[1];
      } else if (item.body_html.includes('BEANS')) {
        process = item.body_html.split('BEANS')[1];
        process = process.split(', ')[0];
      } else if (foundProcessFromTitle) {
        process = foundProcessFromTitle[0].trim();
        process = process.substring(
          process.indexOf(':') + 1,
          process.indexOf(',')
        );
        process = process.trim();
      }
      if (process === '') {
        const bodyText = await EightOunceHelper.getProductInfo(
          this.getProductUrl(item, BaseUrl.EightOunce)
        );
        if (bodyText.length !== 0) {
          for (const detail of bodyText) {
            if (detail?.includes('Process:')) {
              process = detail.split('Process:')[1].trim();
            }
          }
        }
      } else {
        process = process.replaceAll('</strong>', '');
        if (process.includes(':')) {
          process = process.split(':')[1].trim();
        }
        if (process.includes('<')) {
          process = process.split('<')[0].trim();
        }
      }
    }
    if (process[0] === ':') {
      process = process.split(':')[1].trim();
    }
    if (process.length >= maxProcessLength) {
      if (item.title.includes(ProcessCategory[ProcessCategory.Washed])) {
        return ProcessCategory[ProcessCategory.Washed];
      } else if (
        item.title.includes(ProcessCategory[ProcessCategory.Natural])
      ) {
        return ProcessCategory[ProcessCategory.Natural];
      } else if (item.title.includes(ProcessCategory[ProcessCategory.Honey])) {
        return ProcessCategory[ProcessCategory.Honey];
      } else {
        return defaultProcess;
      }
    }
    if (process !== '') {
      return Helper.firstLetterUppercase(process.split(' ')).join(' ');
    }
    return defaultProcess;
  };

  getProductUrl = (
    item: IShopifyProductResponseData,
    baseUrl: string
  ): string => {
    return baseUrl + '/products/' + item.handle;
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    if (item.title.includes('-')) {
      item.title = item.title.split('-')[1];
    } else if (brands.some((brand) => item.title.includes(brand))) {
      for (const brand of brands) {
        if (item.title.includes(brand)) {
          item.title = item.title.replace(brand, '').trim();
        }
      }
    }
    if (item.title.includes(':')) {
      return item.title.split(':')[0].trim();
    } else if (item.title.includes(',')) {
      return item.title.split(',')[0].trim();
    } else if (item.title.includes('(')) {
      return item.title.split('(')[0].trim();
    }
    return item.title.trim();
  };

  getVariety = async (item: IShopifyProductResponseData): Promise<string[]> => {
    let variety = '';
    const unknownVariety = ['Unknown'];
    const body: string = item.body_html;
    if (body.includes('\nVariety')) {
      variety = body.split('Variety')[1];
      variety = variety.split('\n')[0].trim();
    } else if (body.includes('\nVarieties')) {
      variety = body.split('Varieties')[1];
      variety = variety.split('\n')[0].trim();
    } else {
      if (body.includes('VARIET')) {
        variety = body.split('VARIET')[1];
      } else if (body.includes('Variet')) {
        variety = body.split('Variet')[1];
      } else if (body.includes('BEANS')) {
        variety = body.split('BEANS')[1];
        variety = variety.split(', ')[1];
      }
      if (variety === '') {
        const bodyText = await EightOunceHelper.getProductInfo(
          this.getProductUrl(item, BaseUrl.EightOunce)
        );
        if (bodyText.length !== 0) {
          for (const detail of bodyText) {
            if (detail?.includes('Variety:')) {
              variety = detail.split('Variety:')[1].trim();
            }
          }
        }
      } else {
        variety = variety.replaceAll('</strong>', '');
        if (variety.includes(':')) {
          variety = variety.split(':')[1].trim();
        }
        if (variety.includes('<')) {
          variety = variety.split('<')[0].trim();
        }
      }
    }
    if (variety[0] === ':') {
      variety = variety.split(':')[1].trim();
    }
    if (variety.includes('SL 34 Ruiru 11')) {
      variety = variety.replace('SL 34 ', 'SL 34, ');
    } else if (variety.includes('SL 28 SL 34')) {
      variety = variety.replace('SL 28 ', 'SL 28, ');
    }
    if (variety === 'Red and Yellow Catuai') {
      return [variety];
    }
    let varietyOptions: string[];
    if (
      variety.includes(', ') ||
      variety.includes(' &amp; ') ||
      variety.includes(' + ') ||
      variety.includes(' and ') ||
      variety.includes(' / ') ||
      variety.includes(' & ')
    ) {
      varietyOptions = variety.split(/, | \/ | and | \+ | \&amp; | \& /);
    } else if (variety === '') {
      return unknownVariety;
    } else {
      varietyOptions = [variety];
    }

    for (let i = 0; i < varietyOptions.length; i++) {
      if (varietyOptions[i].includes('%')) {
        varietyOptions[i] = varietyOptions[i].split('%')[1].trim();
      }
    }
    varietyOptions = Helper.firstLetterUppercase(varietyOptions);
    varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
    varietyOptions = Array.from([...new Set(varietyOptions)]);
    if (varietyOptions.length !== 0) {
      return varietyOptions;
    }
    return unknownVariety;
  };

  getWeight = (item: IShopifyProductResponseData): number => {
    let bodyWeight: string = '';
    let weight = 0;
    if (item.title.includes('kg') || item.title.includes('KG')) {
      if (item.title.includes('(')) {
        const titleWeight: string =
          item.title.split('(')[item.title.split('(').length - 1];
        if (titleWeight.includes('kg')) {
          return Number(titleWeight.split('kg')[0].trim()) * 1000;
        }
        return Number(titleWeight.split('KG')[0]) * 1000;
      }
      if (item.title.includes('kg')) {
        let titleWeight = item.title.split('kg')[0];
        titleWeight = titleWeight
          .split(' ')
          [titleWeight.split(' ').length - 1].trim();
        return Number(titleWeight) * 1000;
      }
      let titleWeight = item.title.split('KG')[0];
      titleWeight = titleWeight
        .split(' ')
        [titleWeight.split(' ').length - 1].trim();
      return Number(titleWeight.split('KG')[0]) * 1000;
    } else if (
      item.title.includes('(') &&
      (item.title.includes('g') || item.title.includes('G'))
    ) {
      let titleWeight: string =
        item.title.split('(')[item.title.split('(').length - 1];
      if (titleWeight.toLowerCase().includes('x')) {
        if (titleWeight.includes('g')) {
          titleWeight = titleWeight.split('g')[0].trim();
          const values = titleWeight.toLowerCase().split(/\s?x\s?/);
          return Number(values[0].trim()) * Number(values[1].trim());
        } else if (titleWeight.includes('G')) {
          titleWeight = titleWeight.split('G')[0].trim();
          const values = titleWeight.toLowerCase().split(/\s?x\s?/);
          return Number(values[0].trim()) * Number(values[1].trim());
        }
      }
      if (titleWeight.includes('g')) {
        return Number(titleWeight.split('g')[0].trim());
      }
      return Number(titleWeight.split('G')[0]);
    }
    if (item.body_html.includes('Quantity')) {
      bodyWeight = item.body_html.split('Quantity')[1];
    }
    if (bodyWeight !== '') {
      bodyWeight = bodyWeight.replace('</strong>', '');
      bodyWeight = bodyWeight.replace('Available in', '');
      bodyWeight = bodyWeight.split(':')[1].trim();
      if (bodyWeight.includes('g')) {
        bodyWeight = bodyWeight.split('g')[0];
      } else {
        bodyWeight = bodyWeight.split('G')[0];
      }
      weight = Number(bodyWeight.trim());
      if (weight !== 0 && !Number.isNaN(weight)) {
        return weight;
      }
    }
    for (const variant of item.variants) {
      if (variant.available) {
        return variant.grams;
      }
    }
    if (item.variants[0].grams) {
      return item.variants[0].grams;
    }
    return 0;
  };
}
