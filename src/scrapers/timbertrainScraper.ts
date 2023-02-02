import { ProcessCategory } from '../enums/processCategory';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';
import { IWordpressScraper } from '../interfaces/wordpress/wordpressScraper.interface';
import { CheerioAPI } from 'cheerio';
import { TimbertrainHelper } from '../helper/timbertrainHelper';
import { IWordpressProductResponseData } from '../interfaces/wordpress/wordpressResponseData.interface';

export default class TimbertrainScraper implements IWordpressScraper {
  getContinent = (country: string): string => {
    return worldData.get(country) ?? 'Unknown';
  };

  getCountry = ($: CheerioAPI): string => {
    const descriptionContent = TimbertrainHelper.getProductInfo($);
    const titleText = $('[class^="product-title"]').first().text();
    const countryList = new Set<string>();
    for (const country of worldData.keys()) {
      if (titleText.includes(country)) {
        countryList.add(country);
      }
    }
    if (countryList.size === 0) {
      for (const detail of descriptionContent) {
        if (detail.includes('Country')) {
          for (const country of worldData.keys()) {
            if (detail.includes(country)) {
              countryList.add(country);
            }
          }
        }
      }
    }
    if (countryList.size === 0) {
      return 'Unknown';
    }
    if (countryList.size === 1) {
      return [...countryList][0];
    }
    return 'Multiple';
  };

  getDateAdded = (item: IWordpressProductResponseData): string => {
    return new Date(item.modified).toISOString();
  };

  getHandle = (slug: string): string => {
    return slug;
  };

  getImageUrl = ($: CheerioAPI): string => {
    const imageElement = $('.wp-post-image').attr('src');
    return imageElement as string;
  };

  getPrice = ($: CheerioAPI): number => {
    let price = $('[class^="price"]').text();
    if (price.includes('–')) {
      price = price.split('–')[0].trim();
    }
    if (price !== '') {
      if (price.includes('$')) {
        price = price.split('$')[1].trim();
      }
      return Number(Number(price.trim()).toFixed(2));
    }
    return 0;
  };

  getProcess = ($: CheerioAPI): string => {
    const descriptionContent = TimbertrainHelper.getProductInfo($);
    for (const detail of descriptionContent) {
      if (detail.includes('Process:')) {
        let process = detail.split('Process:')[1].trim();
        process = process.split('\n')[0].trim();
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
    return $('[class^="single_add_to_cart_button"]').length ? false : true;
  };

  getVariety = ($: CheerioAPI): string[] => {
    const descriptionContent = TimbertrainHelper.getProductInfo($);
    let variety = '';
    for (const detail of descriptionContent) {
      if (detail.includes('Variety:')) {
        variety = detail.split('Variety:')[1].trim();
        variety = variety.split('\n')[0].trim();
      }
    }
    if (variety === '') {
      return ['Unknown'];
    }
    if (variety.includes('(')) {
      variety = variety.split('(')[0].trim();
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
    const descriptionContent = TimbertrainHelper.getProductInfo($);
    const poundsToGrams = 454;
    let weightOptions: string[];
    let weight = '';
    if ($('#pa_bag-size').length) {
      weightOptions = $('#pa_bag-size')
        .find('option')
        .toArray()
        .map((node) => $(node).text())
        .filter((value) => !value.toLowerCase().includes('choose an option'));
      if (weightOptions[0].includes('lb')) {
        weight = weightOptions[0].split('lb')[0].trim();
        return Number(weight) * poundsToGrams;
      } else if (weightOptions[0].includes('g')) {
        weight = weightOptions[0].split('g')[0].trim();
        return Number(weight);
      }
    }
    for (const detail of descriptionContent) {
      if (detail.includes('Weight:')) {
        weight = detail.split('Weight:')[1].trim();
        if (weight.includes('lb')) {
          weight = weight.split('lb')[0].trim();
          return Number(weight) * poundsToGrams;
        } else if (weight.includes('g')) {
          weight = weight.split('g')[0].trim();
          return Number(weight);
        }
      }
    }
    return 0;
  };

  getTitle = ($: CheerioAPI): string => {
    const titleText = $('[class^="product-title"]').first().text();
    return titleText.split('–')[0].trim();
  };
}
