import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData.interface';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper.interface';
import { ShopifyBaseScraper } from '../baseScrapers/shopifyBaseScraper';
import Helper from '../helper/helper';
import { BaseUrl } from '../enums/baseUrls';
import { Vendor } from '../enums/vendors';
import { IScraper } from '../interfaces/scrapers/scraper.interface';
import { IShopifyBaseScraper } from '../interfaces/shopify/shopifyBaseScraper.interface';
import { VendorApiUrl } from '../enums/vendorApiUrls';
import { worldData } from '../data/worldData';
import { UNKNOWN, UNKNOWN_ARR } from '../constants';

export default class RossoScraper
  extends ShopifyBaseScraper
  implements IShopifyScraper, IScraper, IShopifyBaseScraper
{
  private vendor = Vendor.Rosso;

  getVendorApiUrl = (): string => {
    return VendorApiUrl.Rosso;
  };

  getVendor = (): string => {
    return this.vendor;
  };

  getBrand = (_item: IShopifyProductResponseData) => {
    return this.vendor;
  };

  getCountry = (item: IShopifyProductResponseData): string => {
    const countryList = new Set<string>();
    let reportBody = '';
    if (item.body_html.includes('Geography')) {
      reportBody = item.body_html.split('Geography')[1].trim();
    }
    if (reportBody.includes('Rosso Direct Trade')) {
      reportBody = reportBody.split('Rosso Direct Trade')[0].trim();
    }
    for (const country of worldData.keys()) {
      if (reportBody.includes(country)) {
        countryList.add(country);
      }
    }
    if (!countryList.size) {
      return 'Unknown';
    } else if (countryList.size === 1) {
      return [...countryList][0];
    }
    return 'Multiple';
  };

  getProcess = (item: IShopifyProductResponseData): string => {
    let process = '';
    if (item.body_html.includes('Process')) {
      process = item.body_html.split('Process')[1];
      process = process.replace('</td>', '');
      process = process.replace(
        '<td style="height: 17px;" data-mce-style="height: 17px;">',
        ''
      );
      process = process.replaceAll('\n', '');
      process = process.split('<')[0];
    }
    if (process !== '') {
      return Helper.convertToUniversalProcess(process);
    }
    return 'Unknown';
  };

  getProductUrl = (item: IShopifyProductResponseData): string => {
    return BaseUrl.Rosso + '/collections/coffee/products/' + item.handle;
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    if (item.title.includes('—')) {
      return item.title.split('—')[0];
    }
    return item.title;
  };

  getVariety = (item: IShopifyProductResponseData): string[] => {
    let variety: string;
    const body = item.body_html;
    if (body.includes('Varietal')) {
      variety = body.split('Varietal')[1];
      variety = variety.split('Process')[0];
    } else {
      return UNKNOWN_ARR;
    }
    variety = variety.replace(/<.*>\n.*<.*">/, '');
    variety = variety.replaceAll(/<.*>\n.*<.*">/g, ', ');
    variety = variety.split('<')[0];
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

  getVarietyString = (item: IShopifyProductResponseData): string => {
    let variety: string;
    const body = item.body_html;
    if (body.includes('Varietal')) {
      variety = body.split('Varietal')[1];
      variety = variety.split('Process')[0];
    } else {
      return UNKNOWN;
    }
    variety = variety.replace(/<.*>\n.*<.*">/, '');
    variety = variety.replaceAll(/<.*>\n.*<.*">/g, ', ');
    variety = variety.split('<')[0];
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

  getTastingNotes = (item: IShopifyProductResponseData): string[] => {
    let notes = '';
    if (item.body_html.includes('Sweetness')) {
      notes = item.body_html.split('Sweetness')[0].trim();
    } else {
      return UNKNOWN_ARR;
    }
    if (notes !== '') {
      if (notes.includes('</em>')) {
        const emphasisArr = notes.split('</em>');
        notes = emphasisArr[emphasisArr.length - 1];
      }
      notes = notes.replace(/<[^>]+>/gi, '').trim();
    }
    if (notes === '') {
      return UNKNOWN_ARR;
    }
    let notesArr = notes.split(/, |\s+\/\s+| and | \+ | \&amp; | \& /);
    if (notesArr[0] === '') {
      notesArr = [notes];
    }
    return Helper.firstLetterUppercase(notesArr);
  };

  getTastingNotesString = (item: IShopifyProductResponseData): string => {
    let notes = '';
    if (item.body_html.includes('Sweetness')) {
      notes = item.body_html.split('Sweetness')[0].trim();
    } else {
      return UNKNOWN;
    }
    if (notes !== '') {
      if (notes.includes('</em>')) {
        const emphasisArr = notes.split('</em>');
        notes = emphasisArr[emphasisArr.length - 1];
      }
      notes = notes.replace(/<[^>]+>/gi, '').trim();
    }
    if (notes === '') {
      return UNKNOWN;
    }
    let notesArr = notes.split(/, |\s+\/\s+| and | \+ | \&amp; | \& /);
    if (notesArr[0] === '') {
      notesArr = [notes];
    }
    return Helper.firstLetterUppercase(notesArr).join(', ');
  };
}
