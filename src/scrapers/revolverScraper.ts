import { ProcessCategory } from '../enums/processCategory';
import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData.interface';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper.interface';
import { ShopifyBaseScraper } from '../baseScrapers/shopifyBaseScraper';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';
import { brands } from '../data/brands';
import { BaseUrl } from '../enums/baseUrls';
import { IScraper } from '../interfaces/scrapers/scraper.interface';
import { Vendor } from '../enums/vendors';
import { IShopifyBaseScraper } from '../interfaces/shopify/shopifyBaseScraper.interface';
import { VendorApiUrl } from '../enums/vendorApiUrls';

export default class RevolverScraper
  extends ShopifyBaseScraper
  implements IShopifyScraper, IScraper, IShopifyBaseScraper
{
  private vendor = Vendor.Revolver;

  getVendorApiUrl = (): string => {
    return VendorApiUrl.Revolver;
  };

  getVendor = (): string => {
    return this.vendor;
  };

  getBrand = (item: IShopifyProductResponseData): string => {
    for (const brand of brands) {
      if (item.title.includes(brand)) {
        return Helper.convertToUniversalBrand(brand);
      }
    }
    return 'Unknown';
  };

  getCountry = (item: IShopifyProductResponseData): string => {
    const unknownCountry: string = 'Unknown';
    const countriesFromComponents: Set<string> = new Set();
    let hasSingleCountry = true;
    let reportBody = '';
    for (const country of worldData.keys()) {
      if (item.title.toLowerCase().includes(country.toLowerCase())) {
        return country;
      }
    }
    if (item.body_html.includes('From:')) {
      reportBody = item.body_html.split('From:')[1];
    } else if (item.body_html.includes('Origin:')) {
      reportBody = item.body_html.split('Origin:')[1];
      hasSingleCountry = false;
    } else if (item.body_html.includes('Components:')) {
      reportBody = item.body_html.split('Components:')[1];
      hasSingleCountry = false;
    }
    if (reportBody !== '') {
      reportBody = reportBody.split('<')[0].trim();
      reportBody = reportBody.toLowerCase();
      if (hasSingleCountry) {
        for (const name of worldData.keys()) {
          if (reportBody.includes(name.toLowerCase())) {
            return name;
          }
        }
      }
      const componentCountryList = reportBody.split(
        /, |\s?\/\s?| and | \+ | \&amp; /
      );
      for (const countryFromComponent of componentCountryList) {
        for (const country of worldData.keys()) {
          if (
            countryFromComponent.toLowerCase().includes(country.toLowerCase())
          ) {
            countriesFromComponents.add(country);
          }
        }
      }
      if (countriesFromComponents.size === 1) {
        return [...countriesFromComponents][0];
      } else if (countriesFromComponents.size > 1) {
        return 'Multiple';
      }
    }
    return unknownCountry;
  };

  getProcess = (item: IShopifyProductResponseData): string => {
    let process = 'Unknown';
    if (item.body_html.includes('Process:')) {
      process = item.body_html.split('Process:')[1];
      const processOptions: string[] = process.split('<');
      process = processOptions[0].trim();
      return Helper.convertToUniversalProcess(process);
    }
    return process;
  };

  getProcessCategory = (process: string): string => {
    if (
      process === ProcessCategory[ProcessCategory.Washed] ||
      process === ProcessCategory[ProcessCategory.Natural] ||
      process === ProcessCategory[ProcessCategory.Honey] ||
      process === ProcessCategory[ProcessCategory.Unknown]
    ) {
      return process;
    }
    return ProcessCategory[ProcessCategory.Experimental];
  };

  getProductUrl = (item: IShopifyProductResponseData): string => {
    return BaseUrl.Revolver + '/collections/coffee/products/' + item.handle;
  };

  getTitle = (
    item: IShopifyProductResponseData,
    brand?: string,
    country?: string
  ): string => {
    const title = item.title;
    try {
      let newTitle = title;
      if (title.includes(brand as string)) {
        newTitle = title.split(brand as string)[1];
      }
      if (newTitle.includes('*')) {
        const titleOptions = newTitle.split('*');
        if (titleOptions.length > 3) {
          newTitle = titleOptions[titleOptions.length - 4];
        } else {
          newTitle = newTitle.split('*')[0];
        }
      }
      if (newTitle.includes(country as string)) {
        newTitle = newTitle.replace(country as string, '');
      }
      if (newTitle.includes('"')) {
        newTitle = newTitle.replaceAll('"', '');
      }
      if (newTitle.includes("'")) {
        newTitle = newTitle.replaceAll("'", '');
      }
      if (newTitle.includes('(')) {
        newTitle = newTitle.replaceAll('(', '');
      }
      if (newTitle.includes(')')) {
        newTitle = newTitle.replaceAll(')', '');
      }
      newTitle = newTitle.replaceAll(/\s+/g, ' ').trim();
      return newTitle;
    } catch (err) {
      console.error(err);
      return title;
    }
  };

  getVariety = (item: IShopifyProductResponseData): string[] => {
    try {
      if (item.title.includes('Instrumental')) {
        return ['Caturra', 'Castillo', 'Colombia'];
      } else if (item.title.includes('Rootbeer')) {
        return ['Parainema'];
      }
      let variety: string;
      const body = item.body_html;
      if (body.includes('Varietal:')) {
        variety = body.split('Varietal:')[1];
      } else if (body.includes('Variety:')) {
        variety = body.split('Variety:')[1];
      } else if (body.includes('Varieties:')) {
        variety = body.split('Varieties:')[1];
      } else if (body.includes('Varieites')) {
        variety = body.split('Varieites:')[1];
      } else {
        return ['Unknown'];
      }
      let varietyOptions: string[] = variety.split('<');
      variety = varietyOptions[0].trim();
      variety = variety.replaceAll(/\(.*\)/g, '').trim();
      if (
        variety.includes(',') ||
        variety.includes(' &amp; ') ||
        variety.includes('+') ||
        variety.includes(' and ') ||
        variety.includes('/')
      ) {
        varietyOptions = variety.split(/, |\s?\/\s?| and | \+ | \&amp; /);
      } else {
        varietyOptions = [variety];
      }
      varietyOptions = Helper.firstLetterUppercase(varietyOptions);
      varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
      varietyOptions = Array.from([...new Set(varietyOptions)]);
      return varietyOptions;
    } catch (err) {
      console.error(err);
      return ['Unknown'];
    }
  };

  getWeight = (item: IShopifyProductResponseData): number => {
    let body = item.body_html;
    body = body.replaceAll(/<(br|span) data-mce-fragment=\"1\">/g, ' ');
    const words = body.split(' ');
    const weightOptions = words.filter((word) => word.match(/\d+g/g));
    let weight = weightOptions[0];
    weight = weight.split('g')[0].trim();
    if (weight.includes('>')) {
      weight = weight.split('>')[weight.split('>').length - 1].trim();
    }
    if (!isNaN(parseInt(weight))) {
      return parseInt(weight);
    }
    return 0;
  };
}
