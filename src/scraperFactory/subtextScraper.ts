import { ShopifyBaseScraper } from '../baseScrapers/shopifyBaseScraper';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';
import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper';

export default class SubtextScraper
  extends ShopifyBaseScraper
  implements IShopifyScraper
{
  getCountry = (item: IShopifyProductResponseData): string => {
    let title = item.title.split(' | ')[1];
    title = title.split(' - ')[0].trim();
    for (const [country, continent] of worldData) {
      if (title.includes(country)) {
        return country;
      }
    }
    return 'Unknown';
  };

  getProcess = (item: IShopifyProductResponseData): string => {
    let process = item.body_html.split('Process')[1];
    process = process.split('\n')[0].trim();
    return Helper.firstLetterUppercase(process.split(' ')).join(' ');
  };

  getProductUrl = (
    item: IShopifyProductResponseData,
    baseUrl: string
  ): string => {
    return baseUrl + '/collections/filter-coffee-beans/products/' + item.handle;
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    return item.title.split(' | ')[0].trim();
  };

  getVariety = (item: IShopifyProductResponseData): string[] => {
    let variety = item.body_html.split('Varieties')[1];
    variety = variety.split('\n')[0].trim();
    let varietyOptions = variety
      .split(/, | & /)
      .map((variety: string) => variety.trim());
    varietyOptions = Helper.firstLetterUppercase(varietyOptions);
    varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
    varietyOptions = Array.from([...new Set(varietyOptions)]);
    return varietyOptions;
  };
}
