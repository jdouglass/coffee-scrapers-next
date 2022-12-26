import { ProcessCategory } from '../enums/processCategory';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';
import { Page } from 'puppeteer';
import { IWordpressScraper } from '../interfaces/wordpress/wordpressScraper';

export default class LunaScraper implements IWordpressScraper {
  getContinent = (country: string): string => {
    return worldData.get(country) ?? 'Unknown';
  };

  getCountry = async (page: Page): Promise<string> => {
    const descriptionElement = await page.$('[class^="product_title"]');
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

  getImageUrl = async (page: Page): Promise<string> => {
    const priceElement = await page.$eval('.wp-post-image', (el) =>
      el.getAttribute('src')
    );
    return priceElement as string;
  };

  getPrice = async (page: Page): Promise<number> => {
    const priceElement = await page.$('.price');
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
    const descriptionElement = await page.$('.product-summary');
    const descriptionContent =
      (await descriptionElement?.evaluate((el) => el.textContent)) ?? '';
    if (descriptionContent.includes('Processing')) {
      let process = descriptionContent.split('Processing:')[1];
      process = process.split('\n')[0].trim();
      process = process[0].toUpperCase() + process.substring(1).toLowerCase();
      process = Helper.convertToUniversalProcess(process);
      return process;
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

  getSoldOut = async (page: Page): Promise<boolean> => {
    const stockElement = await page.$('[class^="single_add_to_cart_button"]');
    const stockContent =
      (await stockElement?.evaluate((el) => el.textContent)) ?? '';
    if (stockContent.includes('Add to cart')) {
      return false;
    }
    return true;
  };

  getVariety = async (page: Page): Promise<string[]> => {
    const descriptionElement = await page.$('.product-summary');
    const descriptionContent =
      (await descriptionElement?.evaluate((el) => el.textContent)) ?? '';
    let variety = '';
    if (descriptionContent.includes('Variety')) {
      variety = descriptionContent.split('Variety:')[1];
      variety = variety.split('Process')[0].trim();
    } else if (descriptionContent.includes('Varieties')) {
      variety = descriptionContent.split('Varieties:')[1];
      variety = variety.split('Process')[0].trim();
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

  getWeight = async (page: Page): Promise<number> => {
    const gramsToKg = 1000;
    let weightOptions = await page.$$eval(
      '.variation-radios label',
      (options) => {
        return options.map((option) => option.textContent);
      }
    );
    const weightSet = new Set(weightOptions);
    weightOptions = Array.from(weightSet);
    for (let i = 0; i < weightOptions.length; i++) {
      if (weightOptions[i]?.includes('kg')) {
        weightOptions[i] = weightOptions[i]?.split('kg')[0] as string;
        weightOptions[i] = (Number(weightOptions[i]) * gramsToKg).toString();
      } else if (weightOptions[i]?.includes('g')) {
        weightOptions[i] = weightOptions[i]?.split('g')[0] as string;
      }
    }
    const stockElement = await page.$('[class^="single_add_to_cart_button"]');
    const stockContent =
      (await stockElement?.evaluate((el) => el.textContent)) ?? '';
    if (stockContent.includes('Add to cart')) {
      return weightOptions[0] ? Number(weightOptions[0]) : 0;
    }
    return weightOptions[weightOptions.length - 1]
      ? Number(weightOptions[weightOptions.length - 1])
      : 0;
  };

  getTitle = async (page: Page): Promise<string> => {
    const titleElement = await page.$('[class^="product_title"]');
    let titleText =
      (await titleElement?.evaluate((el) => el.textContent)) ?? '';
    if (titleText.includes(' in ')) {
      titleText = titleText.split(' in ')[0].trim();
    }
    return titleText.split('–')[0].trim();
  };
}
