import axios from 'axios';
import { load } from 'cheerio';

export class EightOunceHelper {
  public static async getProductInfo(productUrl: string): Promise<string[]> {
    return (await axios(productUrl)
      .then((res) => {
        if (res.data) {
          const $ = load(res.data as string);
          return $('div[class="grid__item medium-up--one-half"]')
            .find('ul > li')
            .toArray()
            .map((node) => $(node).text());
        } else {
        }
      })
      .catch((e) => {
        console.error(e);
      })) as string[];
  }
}
