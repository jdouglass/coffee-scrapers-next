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

export default class MatchstickScraper
  extends ShopifyBaseScraper
  implements IShopifyScraper, IScraper, IShopifyBaseScraper
{
  private vendor = Vendor.Matchstick;
  private vendorApiUrl = VendorApiUrl.Matchstick;

  getVendorApiUrl = (): string => {
    return this.vendorApiUrl;
  };

  getVendor = (): string => {
    return this.vendor;
  };

  getBrand = (_item: IShopifyProductResponseData) => {
    return this.vendor;
  };

  getCountry = (item: IShopifyProductResponseData): string => {
    let country = '';
    const countryList = new Set<string>();
    for (const country of worldData.keys()) {
      if (item.product_type.toLowerCase().includes(country.toLowerCase())) {
        countryList.add(country);
      }
    }
    if (!countryList.size) {
      if (item.body_html.includes('Origin:')) {
        country = item.body_html.split('Origin:')[1].trim();
        country = country.replace('</span>', '').trim();
        country = country.replace('<span>', '').trim();
        country = country.replace('</strong>', '').trim();
        country = country.replace('<span class="s1">', '').trim();
        country = country.replace('<span mce-data-marked="1">', '').trim();
        country = country
          .replace('<span style="font-weight: 400;">', '')
          .trim();
        country = country
          .replace(
            '<span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">',
            ''
          )
          .trim();
        country = country.split('<')[0].trim();
        for (const location of worldData.keys()) {
          if (country.toLowerCase().includes(location.toLowerCase())) {
            countryList.add(location);
          }
        }
      }
    }
    if (countryList.size === 1) {
      return countryList.values().next().value as string;
    } else if (countryList.size > 1) {
      return 'Multiple';
    }
    return 'Unknown';
  };

  getProcess = (item: IShopifyProductResponseData): string => {
    let process = '';

    if (item.body_html.includes('Process:')) {
      process = item.body_html.split('Process:')[1].trim();
    }

    if (process !== '') {
      process = process.replace('<span>', '').trim();
      process = process.replace('</span>', '').trim();
      process = process.replace('</strong>', '').trim();
      process = process.replaceAll(/<\/?span.*?>/g, '');
      process = process.split('<')[0].trim();
      process = process
        .split(/[+\/]/)
        .map((item) => item.trim())
        .join(', ');
      process = Helper.firstLetterUppercase([process]).join();
      if (process !== '') {
        return Helper.convertToUniversalProcess(process);
      }
    }
    return 'Unknown';
  };

  getProductUrl = (item: IShopifyProductResponseData): string => {
    return BaseUrl.Matchstick + '/collections/coffee/products/' + item.handle;
  };

  getVariety = (item: IShopifyProductResponseData): string[] => {
    let variety = '';
    const body = item.body_html;
    if (body.includes('Variety:')) {
      variety = body.split('Variety:')[1];
    } else if (body.includes('Varieties:')) {
      variety = body.split('Varieties:')[1];
    } else {
      return UNKNOWN_ARR;
    }
    if (variety !== '') {
      variety = variety.replace('<span>', '').trim();
      variety = variety.replace('</span>', '').trim();
      variety = variety.replace('</strong>', '').trim();
      variety = variety.replace('<meta charset="utf-8">', '').trim();
      variety = variety.replaceAll(/<\/?span.*?>/g, '');
      variety = variety.split('<')[0].trim();
      variety = variety.replaceAll(', and', ', ');
      variety = variety.replaceAll('&amp;', ', ');
      variety = variety
        .split(/[+\/\&]/)
        .map((item) => item.trim())
        .join(', ');
      variety = Helper.firstLetterUppercase([variety]).join();
      let varietyOptions: string[];
      if (variety.includes(', ')) {
        varietyOptions = variety.split(', ');
      } else {
        varietyOptions = [variety];
      }
      varietyOptions = Helper.firstLetterUppercase(varietyOptions);
      varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
      varietyOptions = Array.from([...new Set(varietyOptions)]);
      if (varietyOptions.length === 1 && varietyOptions[0] === '') {
        return UNKNOWN_ARR;
      }
      return varietyOptions;
    }
    return UNKNOWN_ARR;
  };

  getVarietyString = (item: IShopifyProductResponseData): string => {
    let variety = '';
    const body = item.body_html;
    if (body.includes('Variety:')) {
      variety = body.split('Variety:')[1];
    } else if (body.includes('Varieties:')) {
      variety = body.split('Varieties:')[1];
    } else {
      return UNKNOWN;
    }
    if (variety !== '') {
      variety = variety.replace('<span>', '').trim();
      variety = variety.replace('</span>', '').trim();
      variety = variety.replace('</strong>', '').trim();
      variety = variety.replace('<meta charset="utf-8">', '').trim();
      variety = variety.replaceAll(/<\/?span.*?>/g, '');
      variety = variety.split('<')[0].trim();
      variety = variety.replaceAll(', and', ', ');
      variety = variety.replaceAll('&amp;', ', ');
      variety = variety
        .split(/[+\/\&]/)
        .map((item) => item.trim())
        .join(', ');
      variety = Helper.firstLetterUppercase([variety]).join();
      let varietyOptions: string[];
      if (variety.includes(', ')) {
        varietyOptions = variety.split(', ');
      } else {
        varietyOptions = [variety];
      }
      varietyOptions = Helper.firstLetterUppercase(varietyOptions);
      varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
      varietyOptions = Array.from([...new Set(varietyOptions)]);
      if (varietyOptions.length === 1 && varietyOptions[0] === '') {
        return UNKNOWN;
      }
      return varietyOptions.join(', ');
    }
    return UNKNOWN;
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    return item.title;
  };

  getWeight = (item: IShopifyProductResponseData): number => {
    const poundToGrams = 453.6;
    const threeQuarters = 0.75;
    for (const variant of item.variants) {
      if (variant.available && variant.grams !== 0) {
        return variant.grams;
      }
    }
    for (const variant of item.variants) {
      if (variant.available) {
        if (variant.title.includes('g')) {
          return Number(variant.title.split('g')[0].trim());
        } else if (variant.title.includes('lb')) {
          const weightStr = variant.title.split('lb')[0].trim();
          if (weightStr === '3/4') {
            return Math.round(threeQuarters * poundToGrams);
          }
          return Math.round(Number(weightStr) * poundToGrams);
        }
      }
    }
    if (item.variants[0].title.includes('g')) {
      return Number(item.variants[0].title.split('g')[0].trim());
    } else if (item.variants[0].title.includes('lb')) {
      const weightStr = item.variants[0].title.split('lb')[0].trim();
      if (weightStr === '3/4') {
        return Math.round(threeQuarters * poundToGrams);
      }
      return Math.round(Number(weightStr) * poundToGrams);
    }
    return item.variants[0].grams;
  };

  getTastingNotes = (item: IShopifyProductResponseData): string[] => {
    let notes = '';
    if (item.body_html.includes('Tasting Notes:')) {
      notes = item.body_html.split('Tasting Notes:')[1].trim();
    }
    if (notes !== '') {
      notes = notes.replace('<br>', '');
      notes = notes.replace(/<\/?span>/, '');
      notes = notes.replace('</strong>', '');
      notes = notes.split('<')[0].trim();
    }
    if (notes === '') {
      return UNKNOWN_ARR;
    }
    let notesArr = notes.split(/,\s+| \/ | and | \+ | \&amp; | \& /);
    if (notesArr[0] === '') {
      notesArr = [notes];
    }
    return Helper.firstLetterUppercase(notesArr);
  };

  getTastingNotesString = (item: IShopifyProductResponseData): string => {
    let notes = '';
    if (item.body_html.includes('Tasting Notes:')) {
      notes = item.body_html.split('Tasting Notes:')[1].trim();
    }
    if (notes !== '') {
      notes = notes.replace('<br>', '');
      notes = notes.replace(/<\/?span>/, '');
      notes = notes.replace('</strong>', '');
      notes = notes.split('<')[0].trim();
    }
    if (notes === '') {
      return UNKNOWN;
    }
    let notesArr = notes.split(/,\s+| \/ | and | \+ | \&amp; | \& /);
    if (notesArr[0] === '') {
      notesArr = [notes];
    }
    return Helper.firstLetterUppercase(notesArr).join(', ');
  };
}
