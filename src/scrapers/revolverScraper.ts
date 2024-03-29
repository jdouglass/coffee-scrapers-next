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
import { UNKNOWN, UNKNOWN_ARR } from '../constants';

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

  getTitle = (item: IShopifyProductResponseData): string => {
    const brand = this.getBrand(item);
    const country = this.getCountry(item);
    const title = item.title;
    try {
      let newTitle = title;
      if (title.includes(brand)) {
        newTitle = title.split(brand)[1];
      }
      if (newTitle.includes('*')) {
        const titleOptions = newTitle.split('*');
        if (titleOptions.length > 3) {
          newTitle = titleOptions[titleOptions.length - 4];
        } else {
          newTitle = newTitle.split('*')[0];
        }
      }
      if (newTitle.includes(country)) {
        newTitle = newTitle.replace(country, '');
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
        return UNKNOWN_ARR;
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
      if (varietyOptions[0] !== '') {
        return varietyOptions;
      }
      return UNKNOWN_ARR;
    } catch (err) {
      console.error(err);
      return UNKNOWN_ARR;
    }
  };

  getVarietyString = (item: IShopifyProductResponseData): string => {
    try {
      if (item.title.includes('Instrumental')) {
        return 'Caturra, Castillo, Colombia';
      } else if (item.title.includes('Rootbeer')) {
        return 'Parainema';
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
        return UNKNOWN;
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
      if (varietyOptions[0] !== '') {
        return varietyOptions.join(', ');
      }
      return UNKNOWN;
    } catch (err) {
      console.error(err);
      return UNKNOWN;
    }
  };

  getWeight = (item: IShopifyProductResponseData): number => {
    const kgToGrams = 1000;
    if (item.title.includes('BULK') && item.title.includes('KG')) {
      item.title = item.title.split('KG')[0];
      const titleWeightOptions = item.title.split(' ');
      if (!isNaN(parseInt(titleWeightOptions[titleWeightOptions.length - 1]))) {
        return (
          parseInt(titleWeightOptions[titleWeightOptions.length - 1]) *
          kgToGrams
        );
      }
    }

    let body = item.body_html;
    body = body.replaceAll(/<(br|span) data-mce-fragment=\"1\">/g, ' ');
    if (body && body.includes(' ')) {
      const words = body.split(' ');
      const weightOptions = words.filter((word) => word.match(/\d+g/g));
      let weight = weightOptions[0];
      if (weight && weight.includes('g')) {
        weight = weight.split('g')[0].trim();
        if (weight.includes('>')) {
          weight = weight.split('>')[weight.split('>').length - 1].trim();
        }
        if (!isNaN(parseInt(weight))) {
          return parseInt(weight);
        }
      }
    }
    return item.variants[0].grams;
  };

  getTastingNotes = (item: IShopifyProductResponseData): string[] => {
    let notes = '';
    if (item.body_html.includes('Notes:')) {
      notes = item.body_html.split('Notes:')[1].trim();
    } else {
      return UNKNOWN_ARR;
    }
    if (notes !== '') {
      notes = notes.replace('<span data-mce-fragment="1">', '').trim();
      notes = notes.split('<')[0].trim();
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
    if (item.body_html.includes('Notes:')) {
      notes = item.body_html.split('Notes:')[1].trim();
    } else {
      return UNKNOWN;
    }
    if (notes !== '') {
      notes = notes.replace('<span data-mce-fragment="1">', '').trim();
      notes = notes.split('<')[0].trim();
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
