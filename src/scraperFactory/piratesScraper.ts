import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData.interface';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper.interface';
import { ShopifyBaseScraper } from '../baseScrapers/shopifyBaseScraper';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';

export default class PiratesScraper
  extends ShopifyBaseScraper
  implements IShopifyScraper
{
  getCountry = (item: IShopifyProductResponseData): string => {
    let reportBody = '';
    const unknownCountry = 'Unknown';
    if (item.body_html.includes('Single ')) {
      reportBody = item.body_html.split('Single ')[1];
    } else if (item.body_html.includes('Origin')) {
      reportBody = item.body_html.split('Origin:')[1];
    }
    if (reportBody !== '') {
      reportBody = reportBody.split('<')[0];
    }
    for (const name of worldData.keys()) {
      if (item.title.includes(name) || reportBody.includes(name)) {
        return name;
      }
    }
    return unknownCountry;
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
    let variety = '';
    const unknownVariety = ['Unknown'];
    const body: string = item.body_html;
    if (body.includes('Varietal:')) {
      variety = body.split('Varietal:')[1];
    } else if (body.includes('Variety:')) {
      variety = body.split('Variety:')[1];
    } else {
      return unknownVariety;
    }
    if (variety !== '') {
      variety = variety.replaceAll('</strong>', '').trim();
      variety = variety.replaceAll('<span>', '').trim();
      variety = variety.replaceAll('</span>', '').trim();
      variety = variety.replaceAll(/\(.*\)/g, '').trim();
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
    }
    return unknownVariety;
  };
}
