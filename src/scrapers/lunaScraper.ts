import { ProcessCategory } from '../enums/processCategory';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';
import { IWordpressScraper } from '../interfaces/wordpress/wordpressScraper.interface';
import { CheerioAPI } from 'cheerio';
import { LunaHelper } from '../helper/lunaHelper';

export default class LunaScraper implements IWordpressScraper {
  getContinent = (country: string): string => {
    return worldData.get(country) ?? 'Unknown';
  };

  getCountry = ($: CheerioAPI): string => {
    const descriptionContent = $('[class^="product_title"]').text();
    const countryList: Array<string> = [];
    for (const country of worldData.keys()) {
      if (descriptionContent.includes(country)) {
        countryList.push(country);
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

  getImageUrl = ($: CheerioAPI): string => {
    const priceElement = $('.wp-post-image').attr('src');
    return priceElement as string;
  };

  getPrice = ($: CheerioAPI): number => {
    const priceContent = $('.price').text();
    if (priceContent !== '') {
      let price = priceContent.split('$')[1];
      price = price.split(' ')[0].trim();
      return Number(Number(price).toFixed(2));
    }
    return 0;
  };

  getProcess = ($: CheerioAPI): string => {
    const descriptionContent = LunaHelper.getProductInfo($);
    for (const detail of descriptionContent) {
      if (detail.includes('Processing:')) {
        let process = detail.split('Processing:')[1];
        process = process.split('\n')[0].trim();
        if (process.includes('Export')) {
          process = process.split('Export')[0].trim();
        }
        process = Helper.firstLetterUppercase([process]).join(' ');
        process = Helper.convertToUniversalProcess(process);
        return process;
      }
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

  getSoldOut = ($: CheerioAPI): boolean => {
    const cartButton = $('[class^="single_add_to_cart_button"]').text();
    if (cartButton.includes('Add to cart')) {
      return false;
    }
    return true;
  };

  getVariety = ($: CheerioAPI): string[] => {
    const descriptionContent = LunaHelper.getProductInfo($);
    let variety = '';
    for (const detail of descriptionContent) {
      if (detail.includes('Variety')) {
        variety = detail.split('Variety:')[1];
        variety = variety.split('Process')[0].trim();
      } else if (detail.includes('Varieties')) {
        variety = detail.split('Varieties:')[1];
        variety = variety.split('Process')[0].trim();
      }
    }
    if (variety === '') {
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

  getWeight = ($: CheerioAPI): number => {
    const gramsToKg = 1000;
    let weightOptions = $('.variation-radios')
      .find('label')
      .toArray()
      .map((node) => $(node).text());
    const weightSet = new Set(weightOptions);
    weightOptions = Array.from(weightSet);
    for (let i = 0; i < weightOptions.length; i++) {
      if (weightOptions[i]?.includes('kg')) {
        weightOptions[i] = weightOptions[i]?.split('kg')[0];
        weightOptions[i] = (Number(weightOptions[i]) * gramsToKg).toString();
      } else if (weightOptions[i]?.includes('g')) {
        weightOptions[i] = weightOptions[i]?.split('g')[0];
      }
    }
    const stockContent = $('[class^="single_add_to_cart_button"]').text();
    if (stockContent.includes('Add to cart')) {
      return weightOptions[0] ? Number(weightOptions[0]) : 0;
    }
    return weightOptions[weightOptions.length - 1]
      ? Number(weightOptions[weightOptions.length - 1])
      : 0;
  };

  getTitle = ($: CheerioAPI): string => {
    let titleText = $('[class^="product_title"]').text();
    if (titleText.includes(' in ')) {
      titleText = titleText.split(' in ')[0].trim();
    }
    return titleText.split('–')[0].trim();
  };
}
