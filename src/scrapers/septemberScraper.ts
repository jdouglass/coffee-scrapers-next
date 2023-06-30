import { ShopifyBaseScraper } from '../baseScrapers/shopifyBaseScraper';
import { UNKNOWN, UNKNOWN_ARR } from '../constants';
import { worldData } from '../data/worldData';
import { BaseUrl } from '../enums/baseUrls';
import { VendorApiUrl } from '../enums/vendorApiUrls';
import { Vendor } from '../enums/vendors';
import Helper from '../helper/helper';
import { StringUtil } from '../helper/stringUtil';
import { IScraper } from '../interfaces/scrapers/scraper.interface';
import { IShopifyBaseScraper } from '../interfaces/shopify/shopifyBaseScraper.interface';
import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData.interface';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper.interface';

export default class SeptemberScraper
  extends ShopifyBaseScraper
  implements IShopifyScraper, IScraper, IShopifyBaseScraper
{
  private vendor = Vendor.September;

  getVendorApiUrl = (): string => {
    return VendorApiUrl.September;
  };

  getVendor = (): string => {
    return this.vendor;
  };

  getBrand = (_item: IShopifyProductResponseData) => {
    return this.vendor;
  };

  getCountry = (item: IShopifyProductResponseData): string => {
    const defaultCountry = 'Unknown';
    let body = item.body_html;
    for (const country of worldData.keys()) {
      if (item.title.toLowerCase().includes(country.toLowerCase())) {
        return country;
      }
    }
    if (body.includes('Origin')) {
      body = body.split('Origin')[1];
      body = body.replace(':', '');
      body = body.replace('</strong>', '');
      body = body.replace('</span>', '');
      body = body.replace('<span class="s2">', '');
      body = body.replace('</b>', '');
      body = body
        .replaceAll('<span data-mce-fragment="1" class="s2">', '')
        .trim();
      body = body.split('<')[0];
      const countrySet = new Set<string>();
      for (const country of worldData.keys()) {
        if (body.toLowerCase().includes(country.toLowerCase())) {
          countrySet.add(country);
        }
      }
      if (!countrySet.size) {
        return defaultCountry;
      }
      if (countrySet.size === 1) {
        return [...countrySet][0];
      } else if (countrySet.size > 1) {
        return 'Multiple';
      }
    }
    return defaultCountry;
  };

  getProcess = (item: IShopifyProductResponseData): string => {
    const cleanedString = StringUtil.removeHtmlTags(item.body_html); // Remove HTML tags

    const processIndex = cleanedString.indexOf('Process');
    if (processIndex === -1) {
      return UNKNOWN;
    }
    const colonIndex = cleanedString.indexOf(':', processIndex);

    // Find the index of "Country", "Producer", and "Variety" in the cleaned string
    const countryIndex = cleanedString.indexOf('Country');
    const producerIndex = cleanedString.indexOf('Producer');
    const varietyIndex = cleanedString.indexOf('Variety');

    // Determine the end index based on the positions of "Country", "Producer", and "Variety"
    let endIndex = cleanedString.length;
    if (countryIndex !== -1) {
      endIndex = Math.min(endIndex, countryIndex);
    }
    if (producerIndex !== -1) {
      endIndex = Math.min(endIndex, producerIndex);
    }
    if (varietyIndex !== -1) {
      endIndex = Math.min(endIndex, varietyIndex);
    }

    // Extract the substring between "Process" and the determined end index
    let processSubstring = cleanedString.substring(colonIndex + 1, endIndex);

    // Remove leading and trailing spaces
    processSubstring = processSubstring.trim();
    processSubstring = StringUtil.convertAndToComma(processSubstring);
    processSubstring = StringUtil.capitalizeFirstLetters(processSubstring);

    return processSubstring || UNKNOWN;
  };

  getProductUrl = (item: IShopifyProductResponseData): string => {
    return BaseUrl.September + '/products/' + item.handle;
  };

  getVariety = (item: IShopifyProductResponseData): string[] => {
    let variety = '';
    const body = item.body_html;
    if (body.includes('Variety')) {
      variety = body.split('Variety')[1];
    } else {
      return UNKNOWN_ARR;
    }
    if (variety !== '') {
      variety = variety.split(':')[1].trim();
      variety = variety.replace('</strong>', '');
      variety = variety.replace('<span class="s3">', '');
      variety = variety.replaceAll('&amp;', ', ');
      variety = variety.split('<')[0].trim();
      variety = variety
        .split(/[+\/]/)
        .map((item) => item.trim())
        .join(', ');
      variety = Helper.firstLetterUppercase([variety]).join();
    }
    let varietyOptions: string[];
    if (variety.includes(', ')) {
      varietyOptions = variety.split(', ');
    } else {
      varietyOptions = [variety];
    }
    varietyOptions = varietyOptions.map((element) => element.trim());
    varietyOptions = Helper.firstLetterUppercase(varietyOptions);
    varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
    varietyOptions = Array.from([...new Set(varietyOptions)]);
    if (varietyOptions[0] !== '') {
      return varietyOptions;
    }
    return UNKNOWN_ARR;
  };

  getVarietyString = (item: IShopifyProductResponseData): string => {
    let variety = '';
    const body = item.body_html;
    if (body.includes('Variety')) {
      variety = body.split('Variety')[1];
    } else {
      return UNKNOWN;
    }
    if (variety !== '') {
      variety = variety.split(':')[1].trim();
      variety = variety.replace('</strong>', '');
      variety = variety.replace('<span class="s3">', '');
      variety = variety.replaceAll('&amp;', ', ');
      variety = variety.split('<')[0].trim();
      variety = variety
        .split(/[+\/]/)
        .map((item) => item.trim())
        .join(', ');
      variety = Helper.firstLetterUppercase([variety]).join();
    }
    let varietyOptions: string[];
    if (variety.includes(', ')) {
      varietyOptions = variety.split(', ');
    } else {
      varietyOptions = [variety];
    }
    varietyOptions = varietyOptions.map((element) => element.trim());
    varietyOptions = Helper.firstLetterUppercase(varietyOptions);
    varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
    varietyOptions = Array.from([...new Set(varietyOptions)]);
    if (varietyOptions[0] !== '') {
      return varietyOptions.join(', ');
    }
    return UNKNOWN;
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    if (item.title.includes('-')) {
      return item.title.split('-')[0].trim();
    }
    return item.title;
  };

  getTastingNotes = (item: IShopifyProductResponseData): string[] => {
    let notes = '';
    if (item.body_html.includes('Impressions')) {
      notes = item.body_html.split('Impressions')[1].trim();
    } else {
      return UNKNOWN_ARR;
    }
    if (notes !== '') {
      notes = notes.replaceAll(':', '').trim();
      notes = notes.replace('</strong>', '');
      notes = notes.replace('</span>', '');
      notes = notes.split('<')[0].trim();
    }
    if (notes === '') {
      return UNKNOWN_ARR;
    }
    let notesArr = notes.split(/, | \/ | and | \+ | \&amp; | \& /);
    if (notesArr[0] === '') {
      notesArr = [notes];
    }
    return Helper.firstLetterUppercase(notesArr);
  };

  getTastingNotesString = (item: IShopifyProductResponseData): string => {
    let notes = '';
    if (item.body_html.includes('Impressions')) {
      notes = item.body_html.split('Impressions')[1].trim();
    } else {
      return UNKNOWN;
    }
    if (notes !== '') {
      notes = notes.replaceAll(':', '').trim();
      notes = notes.replace('</strong>', '');
      notes = notes.replace('</span>', '');
      notes = notes.split('<')[0].trim();
    }
    if (notes === '') {
      return UNKNOWN;
    }
    let notesArr = notes.split(/, | \/ | and | \+ | \&amp; | \& /);
    if (notesArr[0] === '') {
      notesArr = [notes];
    }
    return Helper.firstLetterUppercase(notesArr).join(', ');
  };
}
