import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData.interface';
import { IShopifyScraper } from '../interfaces/shopify/shopifyScraper.interface';
import { ShopifyBaseScraper } from '../baseScrapers/shopifyBaseScraper';
import Helper from '../helper/helper';
import { BaseUrl } from '../enums/baseUrls';
import { Vendor } from '../enums/vendors';
import { IScraper } from '../interfaces/scrapers/scraper.interface';
import { IShopifyBaseScraper } from '../interfaces/shopify/shopifyBaseScraper.interface';
import { VendorApiUrl } from '../enums/vendorApiUrls';
import { worldData } from '../data/worldData';

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
    const countryList = new Set<string>();
    let reportBody = '';
    if (item.body_html.includes('Georgraphy')) {
      reportBody = item.body_html.split('Geography')[1].trim();
    }
    if (reportBody !== '') {
      reportBody = reportBody.replace('<br>', '');
      reportBody = reportBody.replace('</td>', '');
      reportBody = reportBody.replace(
        '<td style="height: 18px;" data-mce-style="height: 18px;">',
        ''
      );
      reportBody = reportBody.replaceAll('\n', '');
      if (reportBody.includes('<')) {
        reportBody = reportBody.split('<')[0].trim();
      }
      for (const country of worldData.keys()) {
        if (reportBody.includes(country)) {
          countryList.add(country);
        }
      }
    }
    if (!countryList.size) {
      return 'Unknown';
    } else if (countryList.size === 1) {
      return [...countryList][0];
    }
    return 'Multiple';
  };

  getProcess = (item: IShopifyProductResponseData): string => {
    let process = '';
    if (item.body_html.includes('Process')) {
      process = item.body_html.split('Process')[1];
      process = process.replace('</td>', '');
      process = process.replace(
        '<td style="height: 17px;" data-mce-style="height: 17px;">',
        ''
      );
      process = process.replaceAll('\n', '');
      process = process.split('<')[0];
    }
    if (process !== '') {
      return Helper.convertToUniversalProcess(process);
    }
    return 'Unknown';
  };

  getProductUrl = (item: IShopifyProductResponseData): string => {
    return BaseUrl.Rosso + '/collections/coffee/products/' + item.handle;
  };

  getTitle = (item: IShopifyProductResponseData): string => {
    if (item.title.includes('—')) {
      return item.title.split('—')[0];
    }
    return item.title;
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
