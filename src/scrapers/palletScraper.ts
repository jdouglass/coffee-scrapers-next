import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData.interface';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper.interface';
import Helper from '../helper/helper';
import { ShopifyBaseScraper } from '../baseScrapers/shopifyBaseScraper';

export default class PalletScraper
  extends ShopifyBaseScraper
  implements IShopifyScraper
{
  getCountry = (item: IShopifyProductResponseData): string => {
    if (item.body_html.includes('Origin')) {
      let country = item.body_html.split('Origin')[1];
      country = country.replaceAll('</strong>', '');
      country = country.replaceAll(/<\/?span>/g, '');
      country = country.replaceAll(/<span data-mce-fragment=\"1\">/g, '');
      country = country.split('-')[1];
      return country.split('<')[0].trim();
    }
    if (
      item.body_html.includes('Blend breakdown') ||
      item.body_html.includes('Blend Breakdown')
    ) {
      return 'Multiple';
    }
    return 'Unknown';
  };

  getProcess = (item: IShopifyProductResponseData): string => {
    if (item.body_html.includes('Process')) {
      let process: string = item.body_html.split(/Process.*-/)[1];
      process = process.split('<')[0].trim();
      return Helper.convertToUniversalProcess(process);
    }
    return 'Unknown';
  };

  getProductUrl = (
    item: IShopifyProductResponseData,
    baseUrl: string
  ): string => {
    return baseUrl + '/collections/coffee/products/' + item.handle;
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    if (item.title.includes(' - ')) {
      const titleElements: string[] = item.title.split(' - ');
      titleElements.pop();
      return titleElements.join(' - ');
    }
    return item.title;
  };

  getVariety = (item: IShopifyProductResponseData): string[] => {
    let variety: string = '';
    if (item.body_html.includes('Varietal')) {
      variety = item.body_html.split('Varietal')[1];
    } else {
      return ['Unknown'];
    }
    variety = variety.replaceAll(
      /<(br|span) (d|D)ata-mce-fragment=\"1\">/g,
      ''
    );
    variety = variety.replaceAll('</strong>', '');
    variety = variety.replaceAll('</span>', '');
    variety = variety.split(/\s?-\s/)[1];
    variety = variety.split('<')[0].trim();
    let varietyOptions = variety
      .split(/, | & | &amp; /)
      .map((variety: string) => variety.trim());
    varietyOptions = Helper.firstLetterUppercase(varietyOptions);
    varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
    varietyOptions = Array.from([...new Set(varietyOptions)]);
    return varietyOptions;
  };
}