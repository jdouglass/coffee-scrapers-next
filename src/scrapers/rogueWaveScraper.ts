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

export default class RogueWaveScraper
  extends ShopifyBaseScraper
  implements IShopifyScraper, IScraper, IShopifyBaseScraper
{
  private vendor = Vendor.RogueWave;

  getVendorApiUrl = (): string => {
    return VendorApiUrl.RogueWave;
  };

  getVendor = (): string => {
    return this.vendor;
  };

  getBrand = (_item: IShopifyProductResponseData) => {
    return this.vendor;
  };

  getCountry = (item: IShopifyProductResponseData): string => {
    for (const country of worldData.keys()) {
      if (item.title.includes(country)) {
        return country;
      }
    }
    let reportBody = item.body_html;
    if (reportBody.includes('Origin:')) {
      reportBody = reportBody.split('Origin:')[1];
    } else if (reportBody.includes('Origin</strong>:')) {
      reportBody = reportBody.split('Origin</strong>:')[1];
    } else if (reportBody.includes('Region:</strong>')) {
      reportBody = reportBody.split('Region:</strong>')[1];
    } else {
      return 'Unknown';
    }
    reportBody = reportBody.replace('</strong>', '');
    reportBody = reportBody.split('<')[0].trim();
    if (reportBody.includes(', ')) {
      reportBody = reportBody.split(', ')[reportBody.split(', ').length - 1];
    }
    return reportBody;
  };

  getProcess = (item: IShopifyProductResponseData): string => {
    const defaultProcess = 'Unknown';
    let process = '';
    if (item.body_html.includes('Process')) {
      process = item.body_html.split('Process')[1];
      process = process.replaceAll('</strong>', '');
      process = process.replaceAll('<strong>', '');
      process = process.replaceAll('&nbsp;', '');
      process = process.replaceAll(
        /<span data-sheets-userformat.*(d|D)ata-mce-fragment=\"1\">/g,
        ''
      );
      process = process.replaceAll(
        /<(br|span) (d|D)ata-mce-fragment=\"1\">/g,
        ''
      );
      process = process.split('<')[0];
      process = process.split(':')[1].trim();
    } else {
      return defaultProcess;
    }
    if (process.includes(' + ')) {
      const processOptions: string[] = process.split(' + ');
      process = processOptions.join(', ');
    }
    if (!process || process !== '') {
      return Helper.convertToUniversalProcess(process);
    }
    return defaultProcess;
  };

  getProductUrl = (item: IShopifyProductResponseData): string => {
    return BaseUrl.RogueWave + '/collections/coffee/products/' + item.handle;
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    for (const country of worldData.keys()) {
      if (item.title.includes(country)) {
        item.title = item.title.replace(country, '').trim();
      }
    }
    if (item.title.charAt(0) === '-') {
      item.title = item.title.substring(1).trim();
    }
    if (item.title.includes('|')) {
      item.title = item.title.split('|')[0];
    }
    return item.title.trim();
  };

  getVariety = (item: IShopifyProductResponseData): string[] => {
    let variety: string;
    const body = item.body_html;
    if (body.includes('Variet')) {
      variety = body.split('Variet')[1];
      variety = variety.split(':')[1];
      variety = variety.replace('</strong>', '');
      variety = variety.replace('</b>', '');
    } else if (body.includes('Varieties:')) {
      variety = body.split('Varieties:')[1];
      variety = variety.replace('</strong>', '');
    } else if (body.includes('Variety</strong>:')) {
      variety = body.split('Variety</strong>:')[1];
    } else if (body.includes('Varieties</strong>:')) {
      variety = body.split('Varieties</strong>:')[1];
    } else {
      return ['Unknown'];
    }
    variety = variety.split('<')[0];
    variety = variety.replace(/\(.*\)/, '').trim();
    variety = variety.replaceAll(/\s+/g, ' ');
    let varietyOptions: string[];
    if (
      variety.includes(', ') ||
      variety.includes(' &amp; ') ||
      variety.includes(' + ') ||
      variety.includes(' and ') ||
      variety.includes('/')
    ) {
      varietyOptions = variety.split(/,|\/| and |\+|\&amp;/);
      varietyOptions = varietyOptions.map((element) => element.trim());
    } else {
      varietyOptions = [variety];
    }
    for (let i = 0; i < varietyOptions.length; i++) {
      varietyOptions[i] = varietyOptions[i].replaceAll(/.*\% /g, '');
    }
    varietyOptions = Helper.firstLetterUppercase(varietyOptions);
    varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
    varietyOptions = Array.from([...new Set(varietyOptions)]);
    return varietyOptions;
  };

  getTastingNotes = (item: IShopifyProductResponseData): string[] => {
    let notes = '';
    if (item.body_html.includes('of:')) {
      notes = item.body_html.split('of:')[1].trim();
    } else if (item.body_html.includes('notes:')) {
      notes = item.body_html.split('notes:')[1].trim();
    } else {
      return ['Unknown'];
    }
    notes = notes.replace(
      'This is one of our main in house Espresso coffees.',
      ''
    );
    if (notes !== '') {
      if (notes.includes('Origin')) {
        notes = notes.split('Origin')[0];
        notes = notes.replace(/<[^>]+>/gi, '').trim();
      }
      if (notes.includes('Region')) {
        notes = notes.split('Region')[0];
        notes = notes.replace(/<[^>]+>/gi, '').trim();
      }
    }
    if (notes === '') {
      return ['Unknown'];
    }
    let notesArr = notes
      .split(/,| \/ |\s?and\s+| \+ | \&amp; | \& |\s+\|\s+/)
      .map((element) => element.trim())
      .filter((element) => element !== '');
    if (notesArr[0] === '') {
      notesArr = [notes];
    }
    notesArr = Helper.firstLetterUppercase(notesArr);
    return notesArr;
  };
}
