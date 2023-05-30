import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData.interface';
import { ShopifyBaseScraper } from '../baseScrapers/shopifyBaseScraper';
import Helper from '../helper/helper';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper.interface';
import { BaseUrl } from '../enums/baseUrls';
import { IScraper } from '../interfaces/scrapers/scraper.interface';
import { Vendor } from '../enums/vendors';
import { IShopifyBaseScraper } from '../interfaces/shopify/shopifyBaseScraper.interface';
import { VendorApiUrl } from '../enums/vendorApiUrls';
import { worldData } from '../data/worldData';
import { MULTIPLE, UNKNOWN, UNKNOWN_ARR } from '../constants';

export default class SeyScraper
  extends ShopifyBaseScraper
  implements IShopifyScraper, IScraper, IShopifyBaseScraper
{
  private vendor = Vendor.Sey;
  private vendorApiUrl = VendorApiUrl.Sey;

  getVendorApiUrl = (): string => {
    return this.vendorApiUrl;
  };

  getVendor = (): string => {
    return this.vendor;
  };

  getBrand = (_item: IShopifyProductResponseData): string => {
    return this.vendor;
  };

  getCountry = (
    _item: IShopifyProductResponseData,
    productDetails?: string[]
  ): string => {
    const countryList = new Set<string>();
    productDetails?.forEach((value) => {
      if (value.includes('Origin')) {
        for (const location of worldData.keys()) {
          if (value.toLowerCase().includes(location.toLowerCase())) {
            countryList.add(location);
          }
        }
      }
    });
    if (countryList.size === 1) {
      return countryList.values().next().value as string;
    } else if (countryList.size > 1) {
      return MULTIPLE;
    }
    return UNKNOWN;
  };

  getProcess = (
    _item: IShopifyProductResponseData,
    productDetails?: string[]
  ): string => {
    let process = '';
    productDetails?.forEach((value) => {
      if (value.includes('Process')) {
        process = value.split('-')[1].trim();
        process = Helper.firstLetterUppercase([process]).join();
        process = Helper.convertToUniversalProcess(process);
      }
    });
    if (process !== '') {
      return process;
    }
    return UNKNOWN;
  };

  getProductUrl = (item: IShopifyProductResponseData): string => {
    return BaseUrl.Sey + '/collections/coffee/products/' + item.handle;
  };

  getVariety = (
    _item: IShopifyProductResponseData,
    productDetails?: string[]
  ): string[] => {
    let variety: string = '';
    productDetails?.forEach((value) => {
      if (value.includes('VARIETAL')) {
        variety = value.split('VARIETAL: ')[1].trim();
      }
    });
    let varietyOptions = [''];
    if (variety !== '') {
      if (variety.includes(',')) {
        varietyOptions = variety
          .split(/,\s+/)
          .map((variety: string) => variety.trim());
      } else {
        varietyOptions = [variety];
      }
      varietyOptions = Helper.firstLetterUppercase(varietyOptions);
      varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
      varietyOptions = Array.from([...new Set(varietyOptions)]);
      return varietyOptions;
    }
    return UNKNOWN_ARR;
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    return item.title;
  };

  getTastingNotes = (
    item: IShopifyProductResponseData,
    _productDetails?: string[]
  ): string[] => {
    let notesBody = '';
    let notesArr: string[] = [];
    if (item.body_html.includes('cup we find')) {
      notesBody = item.body_html.split('cup we find')[1].trim();
    } else if (item.body_html.includes('with a classic profile of')) {
      notesBody = item.body_html.split('with a classic profile of')[1].trim();
    }
    if (notesBody !== '') {
      notesBody = notesBody.split('.')[0];
      notesBody = notesBody.replaceAll(', and ', ', ');
      notesArr = Helper.firstLetterUppercase(notesBody.split(', '));
    }
    if (notesArr.length) {
      return notesArr;
    }
    return UNKNOWN_ARR;
  };

  getWeight = (item: IShopifyProductResponseData): number => {
    const poundToGrams = 453;
    for (const variant of item.variants) {
      if (variant.available) {
        if (variant.title.includes('g')) {
          return Number(variant.title.split('g')[0].trim());
        } else if (variant.title.includes('lb')) {
          return poundToGrams * Number(variant.title.split('lb')[0].trim());
        }
      }
    }
    return item.variants[0].grams;
  };
}
