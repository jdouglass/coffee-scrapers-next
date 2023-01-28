import axios from 'axios';
import { load } from 'cheerio';

export class SubtextHelper {
  public static async getProductInfo(productUrl: string): Promise<string[]> {
    return (await axios(productUrl)
      .then((res) => {
        if (res.data) {
          const $ = load(res.data as string);
          return $('div[class="shg-rich-text shg-default-text-content"]')
            .find('p')
            .toArray()
            .map((node) => $(node).text());
        }
      })
      .catch((e) => {
        console.error(e);
      })) as string[];
  }
}
