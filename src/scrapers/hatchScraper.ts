import { ProcessCategory } from '../enums/processCategory';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';
import { ICrateJoyScraper } from '../interfaces/crateJoy/crateJoyScraper.interface';
import { ICrateJoyImage } from '../interfaces/crateJoy/crateJoyImage.interface';
import { CheerioAPI } from 'cheerio';
import { HatchHelper } from '../helper/hatchHelper';
import { BaseUrl } from '../enums/baseUrls';
import { Vendor } from '../enums/vendors';
import { IScraper } from '../interfaces/scrapers/scraper.interface';

export default class HatchScraper implements ICrateJoyScraper, IScraper {
  private vendor = Vendor.Hatch;

  getVendor = (): string => {
    return this.vendor;
  };

  getBrand = (_$: CheerioAPI) => {
    return this.vendor;
  };

  getContinent = (country: string): string => {
    return worldData.get(country) ?? 'Unknown';
  };

  getCountry = ($: CheerioAPI): string => {
    const descriptionContent = HatchHelper.getProductDetails($);
    const countryList = new Set<string>();
    for (const country of worldData.keys()) {
      if (descriptionContent[0].includes(country)) {
        countryList.add(country);
      }
    }
    if (countryList.size === 0) {
      return 'Unknown';
    }
    if (countryList.size === 1) {
      return countryList.values().next().value as string;
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

  getPrice = ($: CheerioAPI): number => {
    let price = $('p[class="product-price"]').first().text();
    if (price !== '') {
      price = price.split('$')[1];
      price = price.split(' ')[0].trim();
      return Number(Number(price).toFixed(2));
    }
    return 0;
  };

  getProcess = ($: CheerioAPI): string => {
    const descriptionContent = HatchHelper.getProductDetails($);
    for (const detail of descriptionContent) {
      if (detail.includes('Process:')) {
        return detail.split('Process:')[1].trim();
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

  getProductUrl = (id: number): string => {
    return BaseUrl.Hatch + '/shop/product/' + id.toString();
  };

  getSoldOut = ($: CheerioAPI): boolean => {
    const stockContent = $('div[class="stockmsg"]').find('span').text().trim();
    if (
      stockContent.includes('Available') ||
      stockContent.includes('Limited Remaining')
    ) {
      return false;
    }
    return true;
  };

  getVariety = ($: CheerioAPI): string[] => {
    const descriptionContent = HatchHelper.getProductDetails($);
    let variety = '';
    for (const detail of descriptionContent) {
      if (detail.includes('Variety:')) {
        variety = detail.split('Variety:')[1].trim();
      } else if (detail.includes('Varieties:')) {
        variety = detail.split('Varieties:')[1].trim();
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

  getTitle = ($: CheerioAPI): string => {
    return $('.product-title').first().text();
  };
}
