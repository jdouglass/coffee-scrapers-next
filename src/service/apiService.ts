import axios, { AxiosResponse } from 'axios';
import { unwantedTitles } from '../data/unwantedTitles';
import { IShopifyProductResponse } from '../interfaces/shopify/shopifyProductResponse.interface';
import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData.interface';

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
}