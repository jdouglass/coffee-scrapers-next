import axios, { AxiosResponse } from 'axios';
import { unwantedTitles } from '../data/unwantedTitles';
import { BaseUrl } from '../enums/baseUrls';
import { Vendor } from '../enums/vendors';
import { DeMelloHelper } from '../helper/deMelloHelper';
import { LunaHelper } from '../helper/lunaHelper';
import { TimbertrainHelper } from '../helper/timbertrainHelper';
import { IShopifyProductResponse } from '../interfaces/shopify/shopifyProductResponse.interface';
import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData.interface';
import { ISquareSpaceStoreProducts } from '../interfaces/squareSpace/squareSpaceProductResponses.interface';
import { ISquareSpaceStoreProduct } from '../interfaces/squareSpace/squareSpaceStoreProduct.interface';
import { IWordpressProductResponseData } from '../interfaces/wordpress/wordpressResponseData.interface';

export class ApiService {
  private apiUrl: string;
  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async fetchShopifyProducts(): Promise<IShopifyProductResponseData[]> {
    const response: AxiosResponse<IShopifyProductResponse> = await axios.get(
      this.apiUrl
    );
    const products = new Array<IShopifyProductResponseData>();
    let containsUnwantedString = false;
    for (const product of response.data.products) {
      for (const unwantedString of unwantedTitles) {
        if (
          product.title.toLowerCase().includes(unwantedString.toLowerCase()) ||
          product.body_html.toLowerCase().includes(unwantedString.toLowerCase())
        ) {
          containsUnwantedString = true;
        }
      }
      if (!containsUnwantedString) {
        products.push(product);
      }
      containsUnwantedString = false;
    }
    return products;
  }

  async fetchSquareSpaceProducts(): Promise<ISquareSpaceStoreProduct[]> {
    const response: AxiosResponse<ISquareSpaceStoreProducts> = await axios.get(
      this.apiUrl
    );
    const products = new Array<ISquareSpaceStoreProduct>();
    let containsUnwantedString = false;
    for (const product of response.data.items) {
      for (const unwantedString of unwantedTitles) {
        if (
          product.title.toLowerCase().includes(unwantedString.toLowerCase())
        ) {
          containsUnwantedString = true;
        }
      }
      if (!containsUnwantedString) {
        products.push(product);
      }
      containsUnwantedString = false;
    }
    return products;
  }

  async fetchWordpressProducts(
    vendor: string
  ): Promise<IWordpressProductResponseData[]> {
    const scrapedProductUrls = await this.scrapeProductUrls(vendor);
    const response: AxiosResponse<IWordpressProductResponseData[]> =
      await axios.get(this.apiUrl);
    const filteredResponse: IWordpressProductResponseData[] =
      response.data.filter((item) => {
        return scrapedProductUrls!.includes(item.link);
      });
    const products = new Array<IWordpressProductResponseData>();
    let containsUnwantedString = false;
    for (const product of filteredResponse) {
      for (const unwantedString of unwantedTitles) {
        if (
          product.slug.toLowerCase().includes(unwantedString.toLowerCase()) ||
          product.title.rendered
            .toLowerCase()
            .includes(unwantedString.toLowerCase())
        ) {
          containsUnwantedString = true;
        }
      }
      if (!containsUnwantedString) {
        products.push(product);
      }
      containsUnwantedString = false;
    }
    return products;
  }

  private async scrapeProductUrls(vendor: string) {
    let scrapedProductUrls: string[] | undefined;
    if (vendor === Vendor.DeMello) {
      scrapedProductUrls = await DeMelloHelper.getProductUrls(
        BaseUrl.DeMello + '/product-category/coffee/',
        '/shop/'
      );
    } else if (vendor === Vendor.Luna) {
      scrapedProductUrls = await LunaHelper.getProductUrls(
        BaseUrl.Luna + '/product-category/coffee/',
        '/product/'
      );
    } else if (vendor === Vendor.Timbertrain) {
      scrapedProductUrls = await TimbertrainHelper.getProductUrls(
        BaseUrl.Timbertrain + '/product-category/coffee/',
        '/shop/'
      );
    }
    return scrapedProductUrls;
  }
}
