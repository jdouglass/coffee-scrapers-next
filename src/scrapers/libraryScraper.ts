import { ShopifyBaseScraper } from '../baseScrapers/shopifyBaseScraper';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';
import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData.interface';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper.interface';
import { IShopifyVariant } from '../interfaces/shopify/shopifyVariant.interface';

export default class LibraryScraper
  extends ShopifyBaseScraper
  implements IShopifyScraper
{
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

  getProductUrl = (
    item: IShopifyProductResponseData,
    baseUrl: string
  ): string => {
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
}
