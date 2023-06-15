import { ProcessCategory } from '../enums/processCategory';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';
import { IWordpressScraper } from '../interfaces/wordpress/wordpressScraper.interface';
import { CheerioAPI } from 'cheerio';
import { TimbertrainHelper } from '../helper/timbertrainHelper';
import { IWordpressProductResponseData } from '../interfaces/wordpress/wordpressResponseData.interface';
import { Vendor } from '../enums/vendors';
import { IScraper } from '../interfaces/scrapers/scraper.interface';
import { VendorApiUrl } from '../enums/vendorApiUrls';
import { CoffeeType } from '../enums/coffeeTypes';
import { UNKNOWN, UNKNOWN_ARR } from '../constants';

export default class TimbertrainScraper implements IWordpressScraper, IScraper {
  private vendor = Vendor.Timbertrain;

  getProductUrl = (item: IWordpressProductResponseData): string => {
    return item.link;
  };

  getVendor = (): string => {
    return this.vendor;
  };

  getVendorApiUrl = (): string => {
    return VendorApiUrl.Timbertrain;
  };

  getBrand = (
    _item: IWordpressProductResponseData,
    _$?: CheerioAPI
  ): string => {
    return this.vendor;
  };

  getContinent = (country: string): string => {
    return worldData.get(country) ?? 'Unknown';
  };

  getCountry = (
    item: IWordpressProductResponseData,
    _$?: CheerioAPI
  ): string => {
    const countryList = new Set<string>();
    for (const country of worldData.keys()) {
      if (item.title.rendered.includes(country)) {
        countryList.add(country);
      }
    }
    if (!countryList.size && item.excerpt.rendered.includes('Country')) {
      let countryInfo = item.excerpt.rendered.split('Country')[1].trim();
      countryInfo = countryInfo.split('<')[0].trim();
      for (const country of worldData.keys()) {
        if (item.title.rendered.includes(country)) {
          countryList.add(country);
        }
      }
      if (!countryList.size) {
        return 'Unknown';
      }
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

  getProcess = (
    item: IWordpressProductResponseData,
    _$?: CheerioAPI
  ): string => {
    let process = '';
    if (item.excerpt.rendered.includes('Process:')) {
      process = item.excerpt.rendered.split('Process:')[1].trim();
    }
    process = process.split('<')[0].trim();
    if (process === '') {
      return 'Unknown';
    }
    process = process.split('\n')[0].trim();
    process = Helper.firstLetterUppercase([process]).join(' ');
    process = Helper.convertToUniversalProcess(process);
    return process;
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

  getVariety = (
    item: IWordpressProductResponseData,
    _$?: CheerioAPI
  ): string[] => {
    let variety = '';
    if (item.excerpt.rendered.includes('Variety:')) {
      variety = item.excerpt.rendered.split('Variety:')[1].trim();
    }
    variety = variety.split('<')[0].trim();
    if (variety === '') {
      return UNKNOWN_ARR;
    }
    if (variety.includes('(')) {
      variety = variety.split('(')[0].trim();
    }
    let varietyOptions = variety
      .split(/, | & | and | \&amp; /)
      .map((variety: string) => variety.trim());
    varietyOptions = Helper.firstLetterUppercase(varietyOptions);
    varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
    return Array.from([...new Set(varietyOptions)]);
  };

  getVarietyString = (
    item: IWordpressProductResponseData,
    _$?: CheerioAPI
  ): string => {
    let variety = '';
    if (item.excerpt.rendered.includes('Variety:')) {
      variety = item.excerpt.rendered.split('Variety:')[1].trim();
    }
    variety = variety.split('<')[0].trim();
    if (variety === '') {
      return UNKNOWN;
    }
    if (variety.includes('(')) {
      variety = variety.split('(')[0].trim();
    }
    let varietyOptions = variety
      .split(/, | & | and | \&amp; /)
      .map((variety: string) => variety.trim());
    varietyOptions = Helper.firstLetterUppercase(varietyOptions);
    varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
    return Array.from([...new Set(varietyOptions)]).join(', ');
  };

  getWeight = (_item: IWordpressProductResponseData, $: CheerioAPI): number => {
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

  getTitle = (item: IWordpressProductResponseData, _$?: CheerioAPI): string => {
    return item.title.rendered.replaceAll('&#8211;', '-');
  };

  getTastingNotes = (
    item: IWordpressProductResponseData,
    _$?: CheerioAPI
  ): string[] => {
    let notes = '';
    if (item.excerpt.rendered.includes('notes:')) {
      notes = item.excerpt.rendered.split('notes:')[1].trim();
    } else if (item.excerpt.rendered.includes('notes of:')) {
      notes = item.excerpt.rendered.split('notes of:')[1].trim();
    }
    notes = notes.replace('<strong>', '');
    notes = notes.replace('<br />', '');
    notes = notes.split('<')[0].trim();
    notes = notes.replace('.', '');
    if (notes !== '') {
      const notesArr = notes
        .split(/,| \/ | and | \+ | \&amp; | \& |\s+\|\s+/)
        .map((element) => element.trim())
        .filter((element) => element !== '');
      return Helper.firstLetterUppercase(notesArr);
    }
    return UNKNOWN_ARR;
  };

  getTastingNotesString = (
    item: IWordpressProductResponseData,
    _$?: CheerioAPI
  ): string => {
    let notes = '';
    if (item.excerpt.rendered.includes('notes:')) {
      notes = item.excerpt.rendered.split('notes:')[1].trim();
    } else if (item.excerpt.rendered.includes('notes of:')) {
      notes = item.excerpt.rendered.split('notes of:')[1].trim();
    }
    notes = notes.replace('<strong>', '');
    notes = notes.replace('<br />', '');
    notes = notes.split('<')[0].trim();
    notes = notes.replace('.', '');
    if (notes !== '') {
      const notesArr = notes
        .split(/,| \/ | and | \+ | \&amp; | \& |\s+\|\s+/)
        .map((element) => element.trim())
        .filter((element) => element !== '');
      return Helper.firstLetterUppercase(notesArr).join(', ');
    }
    return UNKNOWN;
  };

  getType = (item: IWordpressProductResponseData): string => {
    if (
      item.title.rendered
        .toLowerCase()
        .includes(CoffeeType.Capsule.toLowerCase()) ||
      item.slug.includes(CoffeeType.Capsule.toLowerCase())
    ) {
      return CoffeeType.Capsule;
    } else if (
      item.title.rendered
        .toLowerCase()
        .includes(CoffeeType.Instant.toLowerCase()) ||
      item.slug.includes(CoffeeType.Instant.toLowerCase())
    ) {
      return CoffeeType.Instant;
    } else if (
      item.title.rendered.toLowerCase().includes('green') ||
      item.slug.includes('green')
    ) {
      return CoffeeType.GreenWholeBean;
    }
    return CoffeeType.RoastedWholeBean;
  };
}
