import { ProcessCategory } from '../enums/processCategory';
import { IShopifyImage } from '../interfaces/shopify/shopifyImage';
import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData';
import { IShopifyVariant } from '../interfaces/shopify/shopifyVariant';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';
import { brands } from '../data/brands';

export default class RevolverScraper implements IShopifyScraper {
  getBrand = (item: IShopifyProductResponseData): string => {
    for (const brand of brands) {
      if (item.title.includes(brand)) {
        return brand;
      }
    }
    return 'Unknown';
  };

  getContinent = (country: string): string => {
    const continent: string | undefined = worldData.get(country);
    if (!continent) {
      return 'Unknown';
    }
    return continent;
  };

  getCountry = (item: IShopifyProductResponseData): string => {
    let reportBody: string = item.body_html.split('From')[0];
    reportBody = reportBody.toLowerCase();
    const country: string = 'Unknown';
    const countryList = worldData.keys();
    for (const name of countryList) {
      if (item.title.includes(name) || reportBody.includes(name)) {
        return name;
      }
    }
    return country;
  };

  getDateAdded = (date: string): string => {
    return new Date(date).toISOString();
  };

  getHandle = (handle: string): string => {
    return handle;
  };

  getImageUrl = (images: IShopifyImage[]) => {
    if (images.length !== 0) {
      return images[0].src;
    }
    return 'https://via.placeholder.com/300x280.webp?text=No+Image+Available';
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

  getProductUrl = (
    item: IShopifyProductResponseData,
    baseUrl: string
  ): string => {
    return baseUrl + '/collections/coffee/products/' + item.handle;
  };

  getSoldOut = (variants: IShopifyVariant[]): boolean => {
    let isAvailable = true;
    for (const variant of variants) {
      if (variant.available) {
        isAvailable = false;
      }
    }
    return isAvailable;
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
    } catch (err) {
      console.log(err);
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
}
