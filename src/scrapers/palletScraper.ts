import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData.interface';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper.interface';
import Helper from '../helper/helper';
import { ShopifyBaseScraper } from '../baseScrapers/shopifyBaseScraper';
import { BaseUrl } from '../enums/baseUrls';
import { Vendor } from '../enums/vendors';
import { IScraper } from '../interfaces/scrapers/scraper.interface';
import { IShopifyBaseScraper } from '../interfaces/shopify/shopifyBaseScraper.interface';
import { VendorApiUrl } from '../enums/vendorApiUrls';
import { UNKNOWN, UNKNOWN_ARR } from '../constants';

export default class PalletScraper
  extends ShopifyBaseScraper
  implements IShopifyScraper, IScraper, IShopifyBaseScraper
{
  private vendor = Vendor.Pallet;
  private vendorApiUrl = VendorApiUrl.Pallet;

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
    if (item.body_html.includes('Origin')) {
      let country = item.body_html.split('Origin')[1];
      country = country.replaceAll('</strong>', '');
      country = country.replaceAll(/<\/?span>/g, '');
      country = country.replaceAll(/<span data-mce-fragment=\"1\">/g, '');
      country = country.split('-')[1];
      return country.split('<')[0].trim();
    }
    if (
      item.body_html.includes('Blend breakdown') ||
      item.body_html.includes('Blend Breakdown')
    ) {
      return 'Multiple';
    }
    return 'Unknown';
  };

  getProcess = (item: IShopifyProductResponseData): string => {
    if (item.body_html.match(/Process.*-/)) {
      let process: string = item.body_html.split(/Process.*-/)[1];
      process = process.split('<')[0].trim();
      return Helper.convertToUniversalProcess(process);
    }
    return 'Unknown';
  };

  getProductUrl = (item: IShopifyProductResponseData): string => {
    return BaseUrl.Pallet + '/collections/coffee/products/' + item.handle;
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    if (item.title.includes(' - ')) {
      const titleElements: string[] = item.title.split(' - ');
      titleElements.pop();
      return titleElements.join(' - ');
    }
    return item.title;
  };

  getVariety = (item: IShopifyProductResponseData): string[] => {
    let variety: string = '';
    if (item.body_html.includes('Varietal')) {
      variety = item.body_html.split('Varietal')[1];
    } else {
      return UNKNOWN_ARR;
    }
    variety = variety.replaceAll(
      /<(br|span) (d|D)ata-mce-fragment=\"1\">/g,
      ''
    );
    variety = variety.replaceAll('</strong>', '');
    variety = variety.replaceAll('</span>', '');
    variety = variety.split(/\s?-\s/)[1];
    variety = variety.split('<')[0].trim();
    let varietyOptions = variety
      .split(/,| & |&amp;|\+| and /)
      .map((variety: string) => variety.trim());
    varietyOptions = varietyOptions.map((element) => element.trim());
    varietyOptions = Helper.firstLetterUppercase(varietyOptions);
    varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
    return Array.from([...new Set(varietyOptions)]);
  };

  getVarietyString = (item: IShopifyProductResponseData): string => {
    let variety: string = '';
    if (item.body_html.includes('Varietal')) {
      variety = item.body_html.split('Varietal')[1];
    } else {
      return UNKNOWN;
    }
    variety = variety.replaceAll(
      /<(br|span) (d|D)ata-mce-fragment=\"1\">/g,
      ''
    );
    variety = variety.replaceAll('</strong>', '');
    variety = variety.replaceAll('</span>', '');
    variety = variety.split(/\s?-\s/)[1];
    variety = variety.split('<')[0].trim();
    let varietyOptions = variety
      .split(/,| & |&amp;|\+| and /)
      .map((variety: string) => variety.trim());
    varietyOptions = varietyOptions.map((element) => element.trim());
    varietyOptions = Helper.firstLetterUppercase(varietyOptions);
    varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
    return Array.from([...new Set(varietyOptions)]).join(', ');
  };

  getTastingNotes = (item: IShopifyProductResponseData): string[] => {
    let notes = '';
    if (item.body_html.includes('Category')) {
      notes = item.body_html.split('Category')[0].trim();
    }
    if (notes !== '') {
      notes = notes.replace(/<[^>]+>/gi, '').trim();
      notes = notes.replaceAll('.', '').trim();
    }
    if (notes === '') {
      return UNKNOWN_ARR;
    }
    let notesArr = notes.split(
      /,\s+| \/ |\s+and\s+| \+ | \&amp; | \& |\s+with\s+/
    );
    if (notesArr[0] === '') {
      notesArr = [notes];
    }
    return Helper.firstLetterUppercase(notesArr);
  };

  getTastingNotesString = (item: IShopifyProductResponseData): string => {
    let notes = '';
    if (item.body_html.includes('Category')) {
      notes = item.body_html.split('Category')[0].trim();
    }
    if (notes !== '') {
      notes = notes.replace(/<[^>]+>/gi, '').trim();
      notes = notes.replaceAll('.', '').trim();
    }
    if (notes === '') {
      return UNKNOWN;
    }
    let notesArr = notes.split(
      /,\s+| \/ |\s+and\s+| \+ | \&amp; | \& |\s+with\s+/
    );
    if (notesArr[0] === '') {
      notesArr = [notes];
    }
    return Helper.firstLetterUppercase(notesArr).join(', ');
  };
}
