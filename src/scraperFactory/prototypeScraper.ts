import { ProcessCategory } from '../enums/processCategory';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';
import { Page } from 'puppeteer';
import { ISquareSpaceScraper } from '../interfaces/squareSpace/squareSpaceScraper';
import { ISquareSpaceProductResponseData } from '../interfaces/squareSpace/squareSpaceResponseData';
import { totalmem } from 'os';

export default class PrototypeScraper implements ISquareSpaceScraper {
  getContinent = (country: string): string => {
    return worldData.get(country) ?? 'Unknown';
  };

  getCountry = (item: ISquareSpaceProductResponseData): string => {
    const title = item.title;
    const excerpt = item.excerpt;
    const countryList: Array<string> = [];
    for (const [key, value] of worldData) {
      if (title.includes(key)) {
        countryList.push(key);
      }
    }
    if (countryList.length === 0) {
      for (const [key, value] of worldData) {
        if (excerpt.includes(key)) {
          countryList.push(key);
        }
      }
    }
    if (countryList.length === 0) {
      return 'Unknown';
    }
    if (countryList.length === 1) {
      return countryList[0];
    }
    return 'Multiple';
  };

  getDateAdded = (item: ISquareSpaceProductResponseData): string => {
    return new Date(item.updatedOn).toISOString();
  };

  getHandle = (item: ISquareSpaceProductResponseData): string => {
    let handle = item.title.toLowerCase();
    if (handle.includes(',')) {
      handle = handle.split(',')[0];
    }
    handle = handle.replaceAll(' ', '-');
    return handle;
  };

  getImageUrl = (image: string): string => {
    return image;
  };

  getPrice = (item: ISquareSpaceProductResponseData): number => {
    return Number(item.variants[0].priceMoney.value);
  };

  getProcess = (item: ISquareSpaceProductResponseData): string => {
    let process = '';
    if (item.body.includes('Process')) {
      process = item.body.split('Process')[1];
      process = process.replaceAll('&nbsp;', '');
      process = process.split('/')[0];
      process = process.split(':')[1];
      if (process.includes('#')) {
        process = process.split('#')[0];
      }
      return process.trim();
    }
    return 'Unknown';
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
    baseUrl: string,
    item: ISquareSpaceProductResponseData
  ): string => {
    return baseUrl + item.fullUrl;
  };

  getSoldOut = async (page: Page): Promise<boolean> => {
    const addToCartButton = await page.$('.sqs-add-to-cart-button-inner');
    const addToCartButtonContent =
      (await addToCartButton?.evaluate((el) => el.textContent)) ?? '';
    if (addToCartButtonContent.includes('Add To Cart')) {
      return false;
    }
    return true;
  };

  getVariety = (item: ISquareSpaceProductResponseData): string[] => {
    let variety = '';
    if (item.body.includes('Cultivar')) {
      variety = item.body.split('Cultivar')[1];
      variety = variety.replaceAll('&nbsp;', '');
      variety = variety.split('/')[0];
      variety = variety.split(':')[1].trim();
    } else {
      return ['Unknown'];
    }
    let varietyOptions = variety
      .split(/, | & | and /)
      .map((variety: string) => variety.trim());
    varietyOptions = Helper.firstLetterUppercase(varietyOptions);
    varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
    varietyOptions = Array.from([...new Set(varietyOptions)]);
    return varietyOptions;
  };

  getWeight = (item: ISquareSpaceProductResponseData): number => {
    let body = item.excerpt;
    body = body.replaceAll(/<p class=\"\">/g, ' ');
    const words = body.split(' ');
    const weightOptions = words.filter((word) => word.match(/\d+g/g));
    let weight = weightOptions[0];
    weight = weight.split('g')[0].trim();
    if (weight.includes('>')) {
      weight = weight.split('>')[weight.split('>').length - 1].trim();
    }
    if (!isNaN(parseInt(weight))) {
      return parseInt(weight);
    }
    return 0;
  };

  getTitle = (item: ISquareSpaceProductResponseData): string => {
    let title = item.title;
    if (title.includes(',')) {
      title = title.split(',')[0];
    }
    if (title.includes('(')) {
      title = title.split('(')[0];
    }
    return title.trim();
  };
}
