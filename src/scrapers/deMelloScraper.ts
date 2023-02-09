import { ProcessCategory } from '../enums/processCategory';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';
import { IWordpressScraper } from '../interfaces/wordpress/wordpressScraper.interface';
import { CheerioAPI } from 'cheerio';
import { DeMelloHelper } from '../helper/deMelloHelper';
import { IWordpressProductResponseData } from '../interfaces/wordpress/wordpressResponseData.interface';

export default class DeMelloScraper implements IWordpressScraper {
  getContinent = (country: string): string => {
    return worldData.get(country) ?? 'Unknown';
  };

  getCountry = ($: CheerioAPI): string => {
    const descriptionContent = DeMelloHelper.getProductInfo($);
    const titleText = $('[class^="product_title"]').first().text();
    const countryList = new Set<string>();
    for (const country of worldData.keys()) {
      if (titleText.includes(country)) {
        countryList.add(country);
      }
    }
    if (countryList.size === 0) {
      for (const detail of descriptionContent) {
        if (detail.includes('COUNTRY') || detail.includes('REGION')) {
          for (const country of worldData.keys()) {
            if (detail.toLowerCase().includes(country.toLowerCase())) {
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
    const imageElement = $('[class^="wp-post-image"]').attr('src');
    return imageElement as string;
  };

  getPrice = ($: CheerioAPI): number => {
    let price = $('[class="price"]').text();
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
    const descriptionContent = DeMelloHelper.getProductInfo($);
    for (const detail of descriptionContent) {
      if (detail.includes('PROCESS')) {
        let process = detail.split('PROCESS')[1].trim();
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
    const descriptionContent = DeMelloHelper.getProductInfo($);
    let variety = '';
    for (const detail of descriptionContent) {
      if (detail.includes('VARIETY')) {
        variety = detail.split('VARIETY')[1].trim();
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
    const defaultSize = 227;
    let weightOptions: string[];
    if ($('#size').length) {
      weightOptions = $('#size')
        .find('option')
        .toArray()
        .map((node) => $(node).text())
        .filter((value) => !value.toLowerCase().includes('choose an option'));
      for (const value of weightOptions) {
        if (value.includes('g')) {
          return Number(value.split('g')[0].trim());
        }
      }
    }

    return defaultSize;
  };

  getTitle = ($: CheerioAPI): string => {
    let titleText = $('[class^="product_title"]').first().text();
    for (const country of worldData.keys()) {
      if (titleText.includes(country)) {
        titleText = titleText.replace(country, '').trim();
      }
    }
    return titleText;
  };
}
