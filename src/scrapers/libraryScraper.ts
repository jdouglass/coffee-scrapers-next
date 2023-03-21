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
import { IShopifyVariant } from '../interfaces/shopify/shopifyVariant.interface';

export default class LibraryScraper
  extends ShopifyBaseScraper
  implements IShopifyScraper, IScraper, IShopifyBaseScraper
{
  private vendor = Vendor.Library;
  private vendorApiUrl = VendorApiUrl.Library;

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
    let country = item.title
      .split(' - ')
      [item.title.split(' - ').length - 1].trim();
    country = Helper.firstLetterUppercase([country]).toString();
    if (worldData.has(country)) {
      return country;
    }
    return 'Unknown';
  };

  getPrice = (variants: IShopifyVariant[]): number => {
    const price: any = variants.map((variant) => {
      if (variant.available) {
        return Number(Number(variant.price).toFixed(2));
      }
    });
    if (!price) {
      return Number(Number(variants[0].price).toFixed(2));
    }
    return Number(Number(variants[0].price).toFixed(2));
  };

  getProcess = (item: IShopifyProductResponseData): string => {
    if (item.body_html.includes('Processing:')) {
      let process: string = item.body_html.split('Processing:')[1];
      process = process.replaceAll(/<span data-mce-fragment=\"1\">/g, '');
      process = process.split('<')[0].trim();
      return Helper.convertToUniversalProcess(process);
    }
    return 'Unknown';
  };

  getProductUrl = (item: IShopifyProductResponseData): string => {
    const baseUrl = BaseUrl.LibrarySpecialtyCoffee;
    for (const variant of item.variants) {
      if (variant.available) {
        return (
          baseUrl +
          '/collections/frontpage/products/' +
          item.handle +
          '?variant=' +
          variant.id.toString()
        );
      }
    }
    return (
      baseUrl +
      '/collections/frontpage/products/' +
      item.handle +
      '?variant=' +
      item.variants[0].id.toString()
    );
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    if (item.title.includes(' - ') && this.getCountry(item) !== 'Unknown') {
      const titleElements: string[] = item.title.split(' - ');
      titleElements.pop();
      return titleElements.join(' - ');
    }
    return item.title;
  };

  getVariety = (item: IShopifyProductResponseData): string[] => {
    let variety: string;
    const body = item.body_html;
    if (body.includes('Variety:')) {
      variety = body.split('Variety:')[1];
      variety = variety.split('<')[0].trim();
    } else {
      return ['Unknown'];
    }
    let varietyOptions: string[];
    if (variety.includes(',')) {
      varietyOptions = variety.split(', ');
    } else {
      varietyOptions = [variety];
    }
    varietyOptions = Helper.firstLetterUppercase(varietyOptions);
    varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
    varietyOptions = Array.from([...new Set(varietyOptions)]);
    return varietyOptions;
  };

  getTastingNotes = (item: IShopifyProductResponseData): string[] => {
    let notes = '';
    if (item.body_html.includes('Cup:')) {
      notes = item.body_html.split('Cup:')[1].trim();
    }
    if (notes !== '') {
      notes = notes.split('<')[0];
    }
    if (notes === '') {
      return ['Unknown'];
    }
    let notesArr = notes.split(/,\s+| \/ | and | \+ | \&amp; | \& /);
    if (notesArr[0] === '') {
      notesArr = [notes];
    }
    notesArr = Helper.firstLetterUppercase(notesArr);
    return notesArr;
  };
}
