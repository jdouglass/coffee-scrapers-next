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

export default class AngryRoasterScraper
  extends ShopifyBaseScraper
  implements IShopifyBaseScraper, IShopifyScraper, IScraper
{
  private vendor = Vendor.TheAngryRoaster;
  private vendorApiUrl = VendorApiUrl.AngryRoaster;

  getVendorApiUrl = (): string => {
    return this.vendorApiUrl;
  };

  getBrand = (_item: IShopifyProductResponseData): string => {
    return this.vendor;
  };

  getCountry = (item: IShopifyProductResponseData): string => {
    let country = '';
    if (item.body_html.includes('Origin')) {
      country = item.body_html.split('Origin:')[1];
    } else {
      const title = Helper.firstLetterUppercase([item.title]).join();
      for (const country of worldData.keys()) {
        if (title.includes(country)) {
          return country;
        }
      }
    }
    if (country !== '') {
      country = country.replaceAll(/\<.*?\>/g, '\n').trim();
      country = country.split('\n')[0].trim();
      country = Helper.firstLetterUppercase([country]).join();
      if (worldData.has(country)) {
        return country;
      }
    }
    return 'Unknown';
  };

  getProcess = (item: IShopifyProductResponseData): string => {
    let process = '';

    if (item.body_html.includes('Method:')) {
      process = item.body_html.split('Method:')[1];
    } else if (item.body_html.includes('Process:')) {
      process = item.body_html.split('Process:')[1];
    }
    if (process !== '') {
      process = process.replaceAll(/\<.*?\>/g, '\n').trim();
      process = process.split('\n')[0].trim();
      process = Helper.firstLetterUppercase([process]).join();
      return Helper.convertToUniversalProcess(process);
    }
    return 'Unknown';
  };

  getProductUrl = (item: IShopifyProductResponseData): string => {
    return BaseUrl.TheAngryRoaster + '/collections/all/products/' + item.handle;
  };

  getVarietyString = (item: IShopifyProductResponseData): string => {
    let variety: string;
    const body = item.body_html;
    if (body.includes('Variety:')) {
      variety = body.split('Variety:')[1];
      variety = variety.replaceAll(/\<.*?\>/g, '\n').trim();
      variety = variety.split('\n')[0].trim();
      variety = Helper.firstLetterUppercase([variety]).join();
    } else {
      return UNKNOWN;
    }
    let varietyOptions: string[];
    if (variety.includes(',')) {
      varietyOptions = variety.split(', ');
    } else {
      varietyOptions = [variety];
    }
    varietyOptions = Helper.firstLetterUppercase(varietyOptions);
    varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
    return Array.from([...new Set(varietyOptions)]).join(', ');
  };

  getVariety = (item: IShopifyProductResponseData): string[] => {
    let variety: string;
    const body = item.body_html;
    if (body.includes('Variety:')) {
      variety = body.split('Variety:')[1];
      variety = variety.replaceAll(/\<.*?\>/g, '\n').trim();
      variety = variety.split('\n')[0].trim();
      variety = Helper.firstLetterUppercase([variety]).join();
    } else {
      return UNKNOWN_ARR;
    }
    let varietyOptions: string[];
    if (variety.includes(',')) {
      varietyOptions = variety.split(', ');
    } else {
      varietyOptions = [variety];
    }
    varietyOptions = Helper.firstLetterUppercase(varietyOptions);
    varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
    return Array.from([...new Set(varietyOptions)]);
  };

  getTastingNotesString = (item: IShopifyProductResponseData): string => {
    let notes = '';
    if (item.body_html.includes('Notes:')) {
      notes = item.body_html.split('Notes:')[1].trim();
    } else {
      return UNKNOWN;
    }
    if (notes !== '') {
      if (notes.includes('Altitude')) {
        notes = notes.split('Altitude')[0];
        notes = notes.replace(/<[^>]+>/gi, '').trim();
      } else {
        notes = notes.replace('</strong>', '');
        notes = notes.split('<')[0].trim();
      }
    }
    if (notes === '') {
      return UNKNOWN;
    }
    let notesArr = notes.split(/,\s+| \/ | and | \+ |\s+\&amp;\s+| \& /);
    if (notesArr[0] === '') {
      notesArr = [notes];
    }
    return Helper.firstLetterUppercase(notesArr).join(', ');
  };

  getTastingNotes = (item: IShopifyProductResponseData): string[] => {
    let notes = '';
    if (item.body_html.includes('Notes:')) {
      notes = item.body_html.split('Notes:')[1].trim();
    } else {
      return UNKNOWN_ARR;
    }
    if (notes !== '') {
      if (notes.includes('Altitude')) {
        notes = notes.split('Altitude')[0];
        notes = notes.replace(/<[^>]+>/gi, '').trim();
      } else {
        notes = notes.replace('</strong>', '');
        notes = notes.split('<')[0].trim();
      }
    }
    if (notes === '') {
      return UNKNOWN_ARR;
    }
    let notesArr = notes.split(/,\s+| \/ | and | \+ |\s+\&amp;\s+| \& /);
    if (notesArr[0] === '') {
      notesArr = [notes];
    }
    return Helper.firstLetterUppercase(notesArr);
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    if (item.title.includes('-')) {
      return Helper.firstLetterUppercase([
        item.title.split('-')[0].trim(),
      ]).join();
    }
    return Helper.firstLetterUppercase([item.title]).join();
  };

  getVendor = (): string => {
    return this.vendor;
  };
}
