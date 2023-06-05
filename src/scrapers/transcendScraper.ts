import { ShopifyBaseScraper } from '../baseScrapers/shopifyBaseScraper';
import { worldData } from '../data/worldData';
import { BaseUrl } from '../enums/baseUrls';
import { VendorApiUrl } from '../enums/vendorApiUrls';
import { Vendor } from '../enums/vendors';
import Helper from '../helper/helper';
import { IScraper } from '../interfaces/scrapers/scraper.interface';
import { IShopifyBaseScraper } from '../interfaces/shopify/shopifyBaseScraper.interface';
import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData.interface';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper.interface';

export default class TranscendScraper
  extends ShopifyBaseScraper
  implements IShopifyScraper, IScraper, IShopifyBaseScraper
{
  private vendor = Vendor.Transcend;

  getVendorApiUrl = (): string => {
    return VendorApiUrl.Transcend;
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
    if (item.body_html.includes('Region:')) {
      country = item.body_html.split('Region:')[1].trim();
      country = country.split('<')[0].trim();
      for (const location of worldData.keys()) {
        if (country.toLowerCase().includes(location.toLowerCase())) {
          return location;
        }
      }
    }
    return 'Unknown';
  };

  getProcess = (item: IShopifyProductResponseData): string => {
    let process = '';

    if (item.body_html.includes('Processing Method:')) {
      process = item.body_html.split('Processing Method:')[1].trim();
    } else if (item.body_html.includes('Process:')) {
      process = item.body_html.split('Process:')[1].trim();
    } else if (item.body_html.includes('Processing:')) {
      process = item.body_html.split('Processing:')[1].trim();
    }

    if (process !== '') {
      process = process.replace('</span>', '').trim();
      process = process
        .replace(
          '<span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">',
          ''
        )
        .trim();
      // console.log(process);
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
    return BaseUrl.Transcend + '/products/' + item.handle;
  };

  getVariety = (item: IShopifyProductResponseData): string[] => {
    let variety = '';
    const body = item.body_html;
    if (body.includes('Variety:')) {
      variety = body.split('Variety:')[1];
    } else if (body.includes('Varieties:')) {
      variety = body.split('Varieties:')[1];
    } else {
      return ['Unknown'];
    }
    if (variety !== '') {
      variety = variety.replace('</span>', '').trim();
      variety = variety.replace('<span style="font-weight: 400;">', '').trim();
      variety = variety
        .replace(
          '<span style="font-weight: 400;" data-mce-fragment="1" data-mce-style="font-weight: 400;">',
          ''
        )
        .trim();
      variety = variety
        .replace(
          '<span style="font-weight: 400;" data-mce-style="font-weight: 400;">',
          ''
        )
        .trim();
      variety = variety.split('<')[0].trim();
      variety = variety.replaceAll('&amp;', ', ');
      variety = variety.replaceAll('and', ', ');
      variety = variety.replaceAll(/\(.*\)/g, '');
      variety = variety
        .split(/[+\/\&]/)
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
    varietyOptions = Helper.firstLetterUppercase(varietyOptions);
    varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
    varietyOptions = Array.from([...new Set(varietyOptions)]);
    return varietyOptions;
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    if (item.title.includes('-')) {
      return Helper.firstLetterUppercase([
        item.title.split('-')[0].trim(),
      ]).join();
    }
    return Helper.firstLetterUppercase([item.title]).join();
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
    let notes = item.body_html.split('</h1>')[0];
    if (notes !== '') {
      notes = notes.replace(/<[^>]+>/gi, '').trim();
      const notesArr = notes
        .split(/,| \/ | and | \+ | \&amp; | \& |\s+\|\s+/)
        .map((element) => element.trim())
        .filter((element) => element !== '');
      return Helper.firstLetterUppercase(notesArr);
    }
    return ['Unknown'];
  };
}
