import { ProcessCategory } from '../enums/processCategory';
import { IShopifyImage } from '../interfaces/shopify/shopifyImage';
import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData';
import { IShopifyVariant } from '../interfaces/shopify/shopifyVariant';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';
import { Page } from 'puppeteer';

export default class MonogramScraper implements IShopifyScraper {
  getBrand = (item: IShopifyProductResponseData): string => {
    if (item.handle.includes('atlas')) {
      const titleOptions: string[] = item.title.split('-');
      return titleOptions[0].trim();
    }
    return 'Monogram';
  };

  getContinent = (country: string): string => {
    const continent: string | undefined = worldData.get(country);
    if (!continent) {
      return 'Unknown';
    }
    return continent;
  };

  getCountry = async (
    item: IShopifyProductResponseData,
    page?: Page
  ): Promise<string> => {
    let country: string;
    if (item.body_html.includes('ORIGIN:')) {
      country = item.body_html.split('ORIGIN:')[1];
    } else if (item.body_html.includes('Origin:')) {
      country = item.body_html.split('Origin:')[1];
    } else {
      const productDescriptionElement = await page?.$(
        '.metafield-multi_line_text_field'
      );
      const descriptionContent =
        (await productDescriptionElement?.evaluate((el) => el.textContent)) ??
        '';
      if (descriptionContent.includes('Origin')) {
        country = descriptionContent.split('Origin')[1];
      } else if (descriptionContent.includes('ORIGIN')) {
        country = descriptionContent.split('ORIGIN')[1];
      } else {
        return 'Unknown';
      }
      if (country !== '') {
        country = country.split('\n')[0].trim();
        country = country.split(':')[1].trim();
      }
    }
    country = country
      .replace('<meta charset="utf-8">', '')
      .split('<')[0]
      .trim();
    if (country.includes(', ')) {
      const countryOptions = country.split(', ');
      country = countryOptions[countryOptions.length - 1].trim();
    }
    if (country === 'TIMOR-LESTE') {
      return 'Timor-Leste';
    }
    return Helper.firstLetterUppercase([country]).join(' ');
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

  getProcess = async (
    item: IShopifyProductResponseData,
    page?: Page
  ): Promise<string> => {
    let process: string;
    if (item.body_html.includes('PROCESS:')) {
      process = item.body_html.split('PROCESS:')[1];
    } else if (item.body_html.includes('Process:')) {
      process = item.body_html.split('Process:')[1];
    } else {
      process = item.body_html.split('Processing:')[1];
    }
    if (process) {
      process = process.replace('<span>', '');
      const processOptions: string[] = process.split('<');
      process = processOptions[0].trim();
      return Helper.firstLetterUppercase(process.split(' ')).join(' ');
    }
    const productDescriptionElement = await page?.$(
      '.metafield-multi_line_text_field'
    );
    const descriptionContent =
      (await productDescriptionElement?.evaluate((el) => el.textContent)) ?? '';
    if (descriptionContent.includes('Process')) {
      process = descriptionContent.split('Process')[1];
    } else if (descriptionContent.includes('PROCESS')) {
      process = descriptionContent.split('PROCESS')[1];
    }
    if (process !== '') {
      process = process.split('\n')[0].trim();
      process = process.split(':')[1].trim();
      process = Helper.firstLetterUppercase([process]).join();
      process = Helper.convertToUniversalProcess(process);
      return process;
    }
    return 'Unknown';
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
    return (
      baseUrl +
      '/products/' +
      item.handle +
      '?variant=' +
      item.variants[0].id.toString()
    );
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

  getVariety = async (
    item: IShopifyProductResponseData,
    page?: Page
  ): Promise<string[]> => {
    let variety: string = '';
    const body: string = item.body_html;
    if (body.includes('VARIETY:')) {
      variety = body.split('VARIETY:')[1];
    } else if (body.includes('Variety:')) {
      variety = body.split('Variety:')[1];
    } else {
      const productDescriptionElement = await page?.$(
        '.metafield-multi_line_text_field'
      );
      const descriptionContent =
        (await productDescriptionElement?.evaluate((el) => el.textContent)) ??
        '';
      if (descriptionContent.includes('Variety')) {
        variety = descriptionContent.split('Variety')[1];
      } else if (descriptionContent.includes('VARIETY')) {
        variety = descriptionContent.split('VARIETY')[1];
      }
      if (variety !== '') {
        variety = variety.split('\n')[0].trim();
        variety = variety.split(':')[1].trim();
        variety = Helper.firstLetterUppercase([variety]).join();
      } else {
        return ['Unknown'];
      }
    }
    variety = variety.replace('<meta charset="utf-8">', '');
    variety = variety.replace('<span data-mce-fragment="1">', '');
    variety = variety.replace('</span>', '');
    let varietyOptions = [''];
    if (variety.includes('<')) {
      varietyOptions = variety.split('<');
      variety = varietyOptions[0].trim();
    }
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
  };

  getWeight = (item: IShopifyProductResponseData): number => {
    for (const variant of item.variants) {
      if (variant.available) {
        return variant.grams;
      }
    }
    return item.variants[0].grams;
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    let titleOptions: string[];
    if (item.handle.includes('atlas')) {
      titleOptions = item.title.split('-');
      return titleOptions[titleOptions.length - 1].trim();
    }

    const titleResult: string = item.title.split('-')[0];
    titleOptions = titleResult.split('*');
    if (titleOptions.length > 1) {
      return titleResult[titleResult.length - 1].trim();
    }
    return titleOptions.toString().trim();
  };
}
