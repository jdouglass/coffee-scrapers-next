import { ProcessCategory } from '../enums/processCategory';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';
import { Page } from 'puppeteer';
import { ICrateJoyScraper } from '../interfaces/crateJoy/crateJoyScraper';
import { ICrateJoyImage } from '../interfaces/crateJoy/crateJoyImage';

export default class HatchScraper implements ICrateJoyScraper {
  getContinent = (country: string): string => {
    return worldData.get(country) ?? 'Unknown';
  };

  getCountry = async (page: Page): Promise<string> => {
    const descriptionElement = await page.$('.product-detail-description');
    const descriptionContent =
      (await descriptionElement?.evaluate((el) => el.textContent)) ?? '';
    const countryList: Array<string> = [];
    for (const [key, value] of worldData) {
      if (descriptionContent.includes(key)) {
        countryList.push(key);
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

  getDateAdded = (): string => {
    return new Date().toISOString();
  };

  getHandle = (slug: string): string => {
    return slug;
  };

  getImageUrl = (images: ICrateJoyImage[]): string => {
    if (images.length !== 0) {
      return 'https:' + images[0].url;
    }
    return 'https://via.placeholder.com/300x280.webp?text=No+Image+Available';
  };

  getPrice = async (page: Page): Promise<number> => {
    const priceElement = await page.$('.product-price');
    const priceContent =
      (await priceElement?.evaluate((el) => el.textContent)) ?? '';
    if (priceContent !== '') {
      let price = priceContent.split('$')[1];
      price = price.split(' ')[0].trim();
      return Number(Number(price).toFixed(2));
    }
    return 0;
  };

  getProcess = async (page: Page): Promise<string> => {
    const descriptionElement = await page.$('.product-detail-description');
    const descriptionContent =
      (await descriptionElement?.evaluate((el) => el.textContent)) ?? '';
    if (descriptionContent.includes('Process')) {
      const process = descriptionContent.split('Process:')[1];
      return process.split('\n')[0].trim();
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

  getProductUrl = (id: number, baseUrl: string): string => {
    return baseUrl + '/shop/product/' + id.toString();
  };

  getSoldOut = async (page: Page): Promise<boolean> => {
    const stockElement = await page.$('.stockmsg');
    const stockContent =
      (await stockElement?.evaluate((el) => el.textContent)) ?? '';
    if (stockContent.includes('Available')) {
      return false;
    }
    return true;
  };

  getVariety = async (page: Page): Promise<string[]> => {
    const descriptionElement = await page.$('.product-detail-description');
    const descriptionContent =
      (await descriptionElement?.evaluate((el) => el.textContent)) ?? '';
    let variety = '';
    if (descriptionContent.includes('Variety')) {
      variety = descriptionContent.split('Variety:')[1];
      variety = variety.split('\n')[0].trim();
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

  getWeight = (slug: string, description: string): number => {
    const gramsToKg = 1000;
    const weightArray = slug.split('-');
    const weight = slug.split('-')[slug.split('-').length - 1];
    for (const element of weightArray) {
      if (element.includes('kg')) {
        return Number(element.split('kg')[0]) * gramsToKg;
      }
    }
    if (weight.includes('g')) {
      return Number(weight.split('g')[0]);
    }
    const descriptionWeight: string[] | null = description.match(/\d+(g|kg)/);
    if (descriptionWeight) {
      if (descriptionWeight.includes('kg')) {
        return Number(descriptionWeight[0].split('kg')[0]) * gramsToKg;
      }
      return Number(descriptionWeight[0].split('g')[0]);
    }
    return 0;
  };

  getTitle = async (page: Page): Promise<string> => {
    const titleElement = await page.$('.product-title');
    return (await titleElement?.evaluate((el) => el.textContent)) ?? '';
  };
}
