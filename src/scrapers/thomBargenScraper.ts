import { ShopifyBaseScraper } from '../baseScrapers/shopifyBaseScraper';
import { UNKNOWN, UNKNOWN_ARR } from '../constants';
import { worldData } from '../data/worldData';
import { BaseUrl } from '../enums/baseUrls';
import { VendorApiUrl } from '../enums/vendorApiUrls';
import { Vendor } from '../enums/vendors';
import Helper from '../helper/helper';
import { IScraper } from '../interfaces/scrapers/scraper.interface';
import { IShopifyBaseScraper } from '../interfaces/shopify/shopifyBaseScraper.interface';
import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData.interface';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper.interface';
import { IShopifyVariant } from '../interfaces/shopify/shopifyVariant.interface';

export default class ThomBargenScraper
  extends ShopifyBaseScraper
  implements IShopifyScraper, IScraper, IShopifyBaseScraper
{
  private vendor = Vendor.ThomBargen;

  getVendorApiUrl = (): string => {
    return VendorApiUrl.ThomBargen;
  };

  getVendor = (): string => {
    return this.vendor;
  };

  getBrand = (_item: IShopifyProductResponseData) => {
    return this.vendor;
  };

  getCountry = (item: IShopifyProductResponseData): string => {
    let country = '';
    for (const country of worldData.keys()) {
      if (item.title.toLowerCase().includes(country.toLowerCase())) {
        return country;
      }
    }
    if (item.body_html.includes('Always Sunny is currently from')) {
      country = item.body_html
        .split('Always Sunny is currently from')[1]
        .trim();
      return country.split(':')[0].trim();
    }
    return 'Unknown';
  };

  getProcess = (item: IShopifyProductResponseData): string => {
    let process = '';

    if (item.body_html.includes('Process:')) {
      process = item.body_html.split('Process:')[1].trim();
    } else if (item.body_html.includes('PROCESS:')) {
      process = item.body_html.split('PROCESS:')[1].trim();
    }

    if (process !== '') {
      process = process.replace('</strong>', '').trim();
      process = process.split('<')[0].trim();
      process = process
        .split(/[+\/]/)
        .map((item) => item.trim())
        .join(', ');
      process = Helper.firstLetterUppercase([process]).join();
      return Helper.convertToUniversalProcess(process);
    }
    return 'Unknown';
  };

  getProductUrl = (item: IShopifyProductResponseData): string => {
    return (
      BaseUrl.ThomBargen + '/collections/frontpage/products/' + item.handle
    );
  };

  getSoldOut = (variants: IShopifyVariant[]): boolean => {
    let isAvailable = true;
    for (const variant of variants) {
      if (variant.available) {
        isAvailable = false;
      }
    }
    return isAvailable;
  };

  getVariety = (item: IShopifyProductResponseData): string[] => {
    let variety = '';
    const body = item.body_html;
    if (body.includes('Variet')) {
      variety = body.split('Variet')[1];
    } else if (body.includes('VARIET')) {
      variety = body.split('VARIET')[1];
    } else {
      return UNKNOWN_ARR;
    }
    if (variety !== '') {
      variety = variety.split(':')[1].trim();
      variety = variety.replace('</strong>', '').trim();
      variety = variety.split('<')[0].trim();
      variety = variety.replaceAll('&amp;', ', ');
      variety = variety
        .split(/[+\/\&]/)
        .map((item) => item.trim())
        .join(', ');
      variety = variety.replaceAll(/\d+\%/g, '').trim();
      variety = Helper.firstLetterUppercase([variety]).join();
    }
    let varietyOptions: string[];
    if (variety.includes(', ')) {
      varietyOptions = variety.split(', ');
    } else {
      varietyOptions = [variety];
    }
    varietyOptions = Helper.firstLetterUppercase(varietyOptions);
    varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
    return Array.from([...new Set(varietyOptions)]);
  };

  getVarietyString = (item: IShopifyProductResponseData): string => {
    let variety = '';
    const body = item.body_html;
    if (body.includes('Variet')) {
      variety = body.split('Variet')[1];
    } else if (body.includes('VARIET')) {
      variety = body.split('VARIET')[1];
    } else {
      return UNKNOWN;
    }
    if (variety !== '') {
      variety = variety.split(':')[1].trim();
      variety = variety.replace('</strong>', '').trim();
      variety = variety.split('<')[0].trim();
      variety = variety.replaceAll('&amp;', ', ');
      variety = variety
        .split(/[+\/\&]/)
        .map((item) => item.trim())
        .join(', ');
      variety = variety.replaceAll(/\d+\%/g, '').trim();
      variety = Helper.firstLetterUppercase([variety]).join();
    }
    let varietyOptions: string[];
    if (variety.includes(', ')) {
      varietyOptions = variety.split(', ');
    } else {
      varietyOptions = [variety];
    }
    varietyOptions = Helper.firstLetterUppercase(varietyOptions);
    varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
    return Array.from([...new Set(varietyOptions)]).join(', ');
  };

  getWeight = (item: IShopifyProductResponseData): number => {
    const defaultWeight = 300;
    const poundToGrams = 453.6;
    const containsWeight = item.title.toLowerCase().match(/\d+\s+?lb/);
    if (containsWeight) {
      const weightFromTitle = item.title.toLowerCase().split('lb')[0].trim();
      return (
        Number(weightFromTitle.charAt(weightFromTitle.length - 1)) *
        poundToGrams
      );
    }
    return defaultWeight;
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    if (item.title.includes('-')) {
      return Helper.firstLetterUppercase([
        item.title.split('-')[1].trim(),
      ]).join();
    }
    return Helper.firstLetterUppercase([item.title]).join();
  };

  getTastingNotes = (item: IShopifyProductResponseData): string[] => {
    let notes = '';
    if (item.body_html.includes('Tasting notes:')) {
      notes = item.body_html.split('Tasting notes:')[1].trim();
    } else if (item.body_html.includes('Tasting Notes:')) {
      notes = item.body_html.split('Tasting Notes:')[1].trim();
    } else {
      return UNKNOWN_ARR;
    }
    if (notes !== '') {
      notes = notes.split('<')[0].trim();
    }
    if (notes === '') {
      return UNKNOWN_ARR;
    }
    let notesArr = notes
      .split(/,| \/ | and | \+ | \&amp; | \& |\./)
      .map((element) => element.trim())
      .filter((element) => element !== '');
    if (notesArr[0] === '') {
      notesArr = [notes];
    }
    return Helper.firstLetterUppercase(notesArr);
  };

  getTastingNotesString = (item: IShopifyProductResponseData): string => {
    let notes = '';
    if (item.body_html.includes('Tasting notes:')) {
      notes = item.body_html.split('Tasting notes:')[1].trim();
    } else if (item.body_html.includes('Tasting Notes:')) {
      notes = item.body_html.split('Tasting Notes:')[1].trim();
    } else {
      return UNKNOWN;
    }
    if (notes !== '') {
      notes = notes.split('<')[0].trim();
    }
    if (notes === '') {
      return UNKNOWN;
    }
    let notesArr = notes
      .split(/,| \/ | and | \+ | \&amp; | \& |\./)
      .map((element) => element.trim())
      .filter((element) => element !== '');
    if (notesArr[0] === '') {
      notesArr = [notes];
    }
    return Helper.firstLetterUppercase(notesArr).join(', ');
  };
}
