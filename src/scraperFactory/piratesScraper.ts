import { ProcessCategory } from '../enums/processCategory';
import { IShopifyImage } from '../interfaces/shopify/shopifyImage';
import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData';
import { IShopifyVariant } from '../interfaces/shopify/shopifyVariant';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper';
import { ShopifyBaseScraper } from '../baseScrapers/shopifyBaseScraper';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';

export default class PiratesScraper
  extends ShopifyBaseScraper
  implements IShopifyScraper
{
  getCountry = (item: IShopifyProductResponseData): string => {
    let reportBody: string;
    if (item.body_html.includes('Single ')) {
      reportBody = item.body_html.split('Single ')[1];
    } else {
      reportBody = item.body_html.split('Origin:')[1];
    }
    reportBody = reportBody.split('<')[0];
    const country: string = 'Unknown';
    const countryList = worldData.keys();
    for (const name of countryList) {
      if (item.title.includes(name) || reportBody.includes(name)) {
        return name;
      }
    }
    return country;
  };

  getProcess = (item: IShopifyProductResponseData): string => {
    let process: string = item.body_html.split('Process:')[1];
    const processOptions: string[] = process.split('<');
    process = processOptions[0].trim();
    return Helper.convertToUniversalProcess(process);
  };

  getProductUrl = (
    item: IShopifyProductResponseData,
    baseUrl: string
  ): string => {
    return baseUrl + '/collections/coffee/products/' + item.handle;
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    let title = item.title;
    title = title.split(':')[0];
    const titleOptions = title.split(' ');
    return Helper.firstLetterUppercase(titleOptions).join(' ');
  };

  getVariety = (item: IShopifyProductResponseData): string[] => {
    let variety: string;
    const body: string = item.body_html;
    if (body.includes('Varietal:')) {
      variety = body.split('Varietal:')[1];
    } else if (body.includes('Variety:')) {
      variety = body.split('Variety:')[1];
    } else {
      return ['Unknown'];
    }
    let varietyOptions: string[] = variety.split('<');
    variety = varietyOptions[0].trim();
    variety = variety.replaceAll(/\(.*\)/g, '').trim();
    if (variety.includes(', ')) {
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
