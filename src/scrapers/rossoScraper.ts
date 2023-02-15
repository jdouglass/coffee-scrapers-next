import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData.interface';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper.interface';
import { ShopifyBaseScraper } from '../baseScrapers/shopifyBaseScraper';
import Helper from '../helper/helper';
import { BaseUrl } from '../enums/baseUrls';
import { Vendor } from '../enums/vendors';
import { IScraper } from '../interfaces/scrapers/scraper.interface';
import { IShopifyBaseScraper } from '../interfaces/shopify/shopifyBaseScraper.interface';
import { VendorApiUrl } from '../enums/vendorApiUrls';

export default class RossoScraper
  extends ShopifyBaseScraper
  implements IShopifyScraper, IScraper, IShopifyBaseScraper
{
  private vendor = Vendor.Rosso;

  getVendorApiUrl = (): string => {
    return VendorApiUrl.Rosso;
  };

  getVendor = (): string => {
    return this.vendor;
  };

  getBrand = (_item: IShopifyProductResponseData) => {
    return this.vendor;
  };

  getCountry = (item: IShopifyProductResponseData): string => {
    let reportBody: string = item.body_html.split('Geography')[1];
    reportBody = reportBody.replace(/<.*>\n.*\n<.*">/, '');
    reportBody = reportBody.split('<')[0];
    const georgraphy: string[] = reportBody.split(', ');
    return georgraphy[georgraphy.length - 1];
  };

  getProcess = (item: IShopifyProductResponseData): string => {
    let process: string = item.body_html.split('Process')[1];
    process = process.replace(/<.*>\n.*<.*">/, '');
    process = process.split('<')[0];
    return Helper.convertToUniversalProcess(process);
  };

  getProductUrl = (item: IShopifyProductResponseData): string => {
    return BaseUrl.Rosso + '/collections/coffee/products/' + item.handle;
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    const title = item.title;
    if (title.includes('—')) {
      return title.split('—')[0];
    }
    return title;
  };

  getVariety = (item: IShopifyProductResponseData): string[] => {
    let variety: string;
    const body = item.body_html;
    if (body.includes('Varietal')) {
      variety = body.split('Varietal')[1];
      variety = variety.split('Process')[0];
    } else {
      return ['Unknown'];
    }
    variety = variety.replace(/<.*>\n.*<.*">/, '');
    variety = variety.replaceAll(/<.*>\n.*<.*">/g, ', ');
    variety = variety.split('<')[0];
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
