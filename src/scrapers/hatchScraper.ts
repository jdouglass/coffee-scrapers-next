import { ProcessCategory } from '../enums/processCategory';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';
import { ICrateJoyScraper } from '../interfaces/crateJoy/crateJoyScraper.interface';
import { CheerioAPI } from 'cheerio';
import { HatchHelper } from '../helper/hatchHelper';
import { Vendor } from '../enums/vendors';
import { IScraper } from '../interfaces/scrapers/scraper.interface';
import { CoffeeType } from '../enums/coffeeTypes';
import { UNKNOWN, UNKNOWN_ARR } from '../constants';

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

  getImageUrl = ($: CheerioAPI): string => {
    const imageUrl = $('div[class^="product-gallery-image-subbly"]').attr(
      'data-src'
    );
    return imageUrl
      ? imageUrl
      : 'https://via.placeholder.com/300x280.webp?text=No+Image+Available';
  };

  getPrice = ($: CheerioAPI): number => {
    let price = $('span[class="product-item-price"]').first().text();
    if (price !== '') {
      price = price.split('$')[1].trim();
      return Number(Number(price).toFixed(2));
    }
    return 0;
  };

  getProcess = ($: CheerioAPI): string => {
    const descriptionContent = HatchHelper.getProductDetails($);
    let process = '';
    for (const detail of descriptionContent) {
      if (detail.includes('Process:')) {
        process = detail.split('Process:')[1].trim();
        if (process.toLowerCase().includes('elevation:')) {
          return Helper.firstLetterUppercase([
            process.toLowerCase().split('elevation:')[0].trim(),
          ]).toString();
        }
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

  getProductUrl = (url: string): string => {
    return url;
  };

  getSoldOut = ($: CheerioAPI): boolean => {
    const stockContent = $('span[class="helper-tooltip-stock"]').text().trim();
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
      return UNKNOWN_ARR;
    } else if (variety.toLowerCase().includes('process:')) {
      variety = variety.toLowerCase().split('process:')[0].trim();
    }
    let varietyOptions = variety
      .split(/,| & | and |\//)
      .map((variety: string) => variety.trim())
      .filter((element) => element !== '');
    varietyOptions = varietyOptions.map((variety) => variety.trim());
    varietyOptions = Helper.firstLetterUppercase(varietyOptions);
    varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
    return Array.from([...new Set(varietyOptions)]);
  };

  getVarietyString = ($: CheerioAPI): string => {
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
      return UNKNOWN;
    } else if (variety.toLowerCase().includes('process:')) {
      variety = variety.toLowerCase().split('process:')[0].trim();
    }
    let varietyOptions = variety
      .split(/,| & | and /)
      .map((variety: string) => variety.trim())
      .filter((element) => element !== '');
    varietyOptions = varietyOptions.map((variety) => variety.trim());
    varietyOptions = Helper.firstLetterUppercase(varietyOptions);
    varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
    return Array.from([...new Set(varietyOptions)]).join(', ');
  };

  getWeight = ($: CheerioAPI): number => {
    const gramsToKg = 1000;
    const descriptionContent = HatchHelper.getProductDetails($);
    for (let i = 0; i < descriptionContent.length; i++) {
      if (descriptionContent[i].match(/\d+g/)) {
        return Number(descriptionContent[i].match(/\d+g/)![0].split('g')[0]);
      } else if (descriptionContent[i].match(/\d+kg/)) {
        return (
          Number(descriptionContent[i].match(/\d+kg/)![0].split('kg')[0]) *
          gramsToKg
        );
      }
    }
    const weight = $('select[name="variants"]')
      .children()
      .nextAll()
      .attr('data-name');
    if (weight?.includes('kg')) {
      return Number(weight.split('kg')[0]) * gramsToKg;
    } else if (weight?.includes('g')) {
      return Number(weight.split('g')[0]);
    }
    return 0;
  };

  getTitle = ($: CheerioAPI): string => {
    return $('.product-item-title').text().trim();
  };

  getTastingNotesString = ($: CheerioAPI): string => {
    const descriptionContent = HatchHelper.getProductDetails($);
    let notes = '';
    for (const detail of descriptionContent) {
      if (detail.includes('Notes:')) {
        notes = detail.split('Notes:')[1].trim();
      }
    }
    if (notes === '') {
      return UNKNOWN;
    } else if (notes.toLowerCase().includes('brew:')) {
      notes = notes.toLowerCase().split('brew:')[0].trim();
    } else if (notes.toLowerCase().includes('brew method:')) {
      notes = notes.toLowerCase().split('brew method:')[0].trim();
    }
    const notesArr = notes
      .split(/,| \/ | and | \+ | \&amp; | \& |\s+\|\s+|\./)
      .map((element) => element.trim())
      .filter((element) => element !== '');
    return Helper.firstLetterUppercase(notesArr).join(', ');
  };

  getTastingNotes = ($: CheerioAPI): string[] => {
    const descriptionContent = HatchHelper.getProductDetails($);
    let notes = '';
    for (const detail of descriptionContent) {
      if (detail.includes('Notes:')) {
        notes = detail.split('Notes:')[1].trim();
      }
    }
    if (notes === '') {
      return UNKNOWN_ARR;
    } else if (notes.toLowerCase().includes('brew:')) {
      notes = notes.toLowerCase().split('brew:')[0].trim();
    } else if (notes.toLowerCase().includes('brew method:')) {
      notes = notes.toLowerCase().split('brew method:')[0].trim();
    }
    const notesArr = notes
      .split(/,| \/ | and | \+ | \&amp; | \& |\s+\|\s+|\./)
      .map((element) => element.trim())
      .filter((element) => element !== '');
    return Helper.firstLetterUppercase(notesArr);
  };

  getType = ($: CheerioAPI, slug: string): string => {
    const title = $('.product-item-title').first().text();
    if (
      title.toLowerCase().includes(CoffeeType.Capsule.toLowerCase()) ||
      slug.includes(CoffeeType.Capsule.toLowerCase())
    ) {
      return CoffeeType.Capsule;
    } else if (
      title.toLowerCase().includes(CoffeeType.Instant.toLowerCase()) ||
      slug.includes(CoffeeType.Instant.toLowerCase())
    ) {
      return CoffeeType.Instant;
    } else if (
      title.toLowerCase().includes('green') ||
      slug.includes('green')
    ) {
      return CoffeeType.GreenWholeBean;
    }
    return CoffeeType.RoastedWholeBean;
  };
}
