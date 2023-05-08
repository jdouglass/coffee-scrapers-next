import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData.interface';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper.interface';
import { ShopifyBaseScraper } from '../baseScrapers/shopifyBaseScraper';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';
import { BaseUrl } from '../enums/baseUrls';
import { Vendor } from '../enums/vendors';
import { IScraper } from '../interfaces/scrapers/scraper.interface';
import { IShopifyBaseScraper } from '../interfaces/shopify/shopifyBaseScraper.interface';
import { VendorApiUrl } from '../enums/vendorApiUrls';

export default class PiratesScraper
  extends ShopifyBaseScraper
  implements IShopifyScraper, IScraper, IShopifyBaseScraper
{
  private vendor = Vendor.Pirates;
  private vendorApiUrl = VendorApiUrl.Pirates;

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
    let reportBody = '';
    const unknownCountry = 'Unknown';
    if (item.body_html.includes('Single ')) {
      reportBody = item.body_html.split('Single ')[1];
    } else if (item.body_html.includes('origin from')) {
      reportBody = item.body_html.split('origin from')[1];
    } else if (item.body_html.includes('Origin')) {
      reportBody = item.body_html.split('Origin:')[1];
    }
    if (reportBody !== '') {
      reportBody = reportBody.split('<')[0];
    }
    for (const name of worldData.keys()) {
      if (item.title.includes(name) || reportBody.includes(name)) {
        return name;
      }
    }
    return unknownCountry;
  };

  getProcess = (item: IShopifyProductResponseData): string => {
    let process = '';
    if (item.body_html.includes('Process:')) {
      process = item.body_html.split('Process:')[1];
    }
    if (process === '') {
      return 'Unknown';
    }
    const processOptions: string[] = process.split('<');
    process = processOptions[0].trim();
    return Helper.convertToUniversalProcess(process);
  };

  getProductUrl = (item: IShopifyProductResponseData): string => {
    return (
      BaseUrl.PiratesOfCoffee + '/collections/coffee/products/' + item.handle
    );
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    let title = item.title;
    title = title.split(':')[0];
    const titleOptions = title.split(' ');
    return Helper.firstLetterUppercase(titleOptions).join(' ');
  };

  getVariety = (item: IShopifyProductResponseData): string[] => {
    let variety = '';
    const unknownVariety = ['Unknown'];
    const body: string = item.body_html;
    if (body.includes('Varietal:')) {
      variety = body.split('Varietal:')[1];
    } else if (body.includes('Variety:')) {
      variety = body.split('Variety:')[1];
    } else {
      return unknownVariety;
    }
    if (variety !== '') {
      variety = variety.replaceAll('</strong>', '').trim();
      variety = variety.replaceAll('<span>', '').trim();
      variety = variety.replaceAll('</span>', '').trim();
      variety = variety.replaceAll(/\(.*\)/g, '').trim();
      let varietyOptions: string[] = variety.split('<');
      variety = varietyOptions[0].trim();
      if (
        variety.includes(', ') ||
        variety.includes(' &amp; ') ||
        variety.includes(' + ') ||
        variety.includes(' and ') ||
        variety.includes(' / ')
      ) {
        varietyOptions = variety.split(/, | \/ | and | \+ | \&amp; /);
      } else {
        varietyOptions = [variety];
      }
      varietyOptions = Helper.firstLetterUppercase(varietyOptions);
      varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
      varietyOptions = Array.from([...new Set(varietyOptions)]);
      return varietyOptions;
    }
    return unknownVariety;
  };

  getTastingNotes = (item: IShopifyProductResponseData): string[] => {
    let notes = '';
    if (item.body_html.includes('Tasting Notes')) {
      notes = item.body_html.split('Tasting Notes')[1].trim();
    } else if (item.body_html.includes('Tasting notes')) {
      notes = item.body_html.split('Tasting notes')[1].trim();
    } else {
      return ['Unknown'];
    }
    notes = notes.replace('</strong>', '');
    notes = notes.replace('<span>', '');
    notes = notes.replace('<span data-mce-fragment="1">', '');
    notes = notes.replace(':', '').trim();
    notes = notes.split('<')[0].trim();
    if (notes === '') {
      return ['Unknown'];
    }
    let notesArr = notes.split(/, | \/ | and | \+ | \&amp; | \& |\\n/);
    notesArr = notesArr.filter((element) => element !== '');
    return Helper.firstLetterUppercase(notesArr);
  };
}
