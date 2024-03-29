import { ProcessCategory } from '../enums/processCategory';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';
import { IWordpressScraper } from '../interfaces/wordpress/wordpressScraper.interface';
import { CheerioAPI } from 'cheerio';
import { DeMelloHelper } from '../helper/deMelloHelper';
import { IWordpressProductResponseData } from '../interfaces/wordpress/wordpressResponseData.interface';
import { Vendor } from '../enums/vendors';
import { IScraper } from '../interfaces/scrapers/scraper.interface';
import { VendorApiUrl } from '../enums/vendorApiUrls';
import { NO_IMAGE_AVAILABLE_URL, UNKNOWN, UNKNOWN_ARR } from '../constants';
import { CoffeeType } from '../enums/coffeeTypes';

export default class DeMelloScraper implements IWordpressScraper, IScraper {
  private vendor = Vendor.DeMello;

  getProductUrl = (item: IWordpressProductResponseData): string => {
    return item.link;
  };

  getVendor = (): string => {
    return this.vendor;
  };

  getVendorApiUrl = (): string => {
    return VendorApiUrl.DeMello;
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
    _item: IWordpressProductResponseData,
    $?: CheerioAPI
  ): string => {
    const countryList = new Set<string>();
    if ($) {
      const descriptionContent = DeMelloHelper.getProductInfo($);
      const titleText = $('[class^="product_title"]').first().text();
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
    if (imageElement) {
      return encodeURI(imageElement);
    }
    return NO_IMAGE_AVAILABLE_URL;
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

  getProcess = (
    _item: IWordpressProductResponseData,
    $?: CheerioAPI
  ): string => {
    if ($) {
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

  getVarietyString = (
    _item: IWordpressProductResponseData,
    $?: CheerioAPI
  ): string => {
    let variety = '';
    if ($) {
      const descriptionContent = DeMelloHelper.getProductInfo($);
      for (const detail of descriptionContent) {
        if (detail.includes('VARIETY')) {
          variety = detail.split('VARIETY')[1].trim();
          variety = variety.split('\n')[0].trim();
        }
      }
    }
    if (variety === '') {
      return UNKNOWN;
    }
    if (variety.includes('(')) {
      variety = variety.split('(')[0].trim();
    }
    let varietyOptions = variety
      .split(/, | & | and /)
      .map((variety: string) => variety.trim());
    varietyOptions = Helper.firstLetterUppercase(varietyOptions);
    varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
    return Array.from([...new Set(varietyOptions)]).join(', ');
  };

  getVariety = (
    _item: IWordpressProductResponseData,
    $?: CheerioAPI
  ): string[] => {
    let variety = '';
    if ($) {
      const descriptionContent = DeMelloHelper.getProductInfo($);
      for (const detail of descriptionContent) {
        if (detail.includes('VARIETY')) {
          variety = detail.split('VARIETY')[1].trim();
          variety = variety.split('\n')[0].trim();
        }
      }
    }
    if (variety === '') {
      return UNKNOWN_ARR;
    }
    if (variety.includes('(')) {
      variety = variety.split('(')[0].trim();
    }
    let varietyOptions = variety
      .split(/, | & | and /)
      .map((variety: string) => variety.trim());
    varietyOptions = Helper.firstLetterUppercase(varietyOptions);
    varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
    return Array.from([...new Set(varietyOptions)]);
  };

  getWeight = (_item: IWordpressProductResponseData, $: CheerioAPI): number => {
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

  getTitle = (item: IWordpressProductResponseData, _$?: CheerioAPI): string => {
    for (const country of worldData.keys()) {
      if (item.title.rendered.includes(country)) {
        item.title.rendered = item.title.rendered.replace(country, '').trim();
      }
    }
    item.title.rendered = item.title.rendered.replaceAll('&#8211;', '-');
    item.title.rendered = item.title.rendered.replaceAll('&#8217;', "'");
    return item.title.rendered;
  };

  getTastingNotesString = (
    _item: IWordpressProductResponseData,
    $: CheerioAPI
  ): string => {
    const notes = $('.woocommerce-product-details__short-description')
      .find('p')
      .first()
      .text()
      .trim();
    if (notes !== '') {
      const notesArr = notes
        .split(/,| \/ | and | \+ | \&amp; | \& |\s+\|\s+/)
        .map((element) => element.trim())
        .filter((element) => element !== '');
      return Helper.firstLetterUppercase(notesArr).join(', ');
    }
    return UNKNOWN;
  };

  getTastingNotes = (
    _item: IWordpressProductResponseData,
    $: CheerioAPI
  ): string[] => {
    const notes = $('.woocommerce-product-details__short-description')
      .find('p')
      .first()
      .text()
      .trim();
    if (notes !== '') {
      const notesArr = notes
        .split(/,| \/ | and | \+ | \&amp; | \& |\s+\|\s+/)
        .map((element) => element.trim())
        .filter((element) => element !== '');
      return Helper.firstLetterUppercase(notesArr);
    }
    return UNKNOWN_ARR;
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
