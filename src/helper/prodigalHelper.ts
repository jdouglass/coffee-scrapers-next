import axios from 'axios';
import { load } from 'cheerio';

export class ProdigalHelper {
  public static async getProductInfo(productUrl: string): Promise<string[]> {
    return (await axios(productUrl)
      .then((res) => {
        if (res.data) {
          const $ = load(res.data as string);
          const details = $('.product__title')
            .next()
            .toArray()
            .map((node) =>
              $(node)
                .text()
                .trim()
                .replace(/\s+\•\s+/g, ', ')
            )
            .filter((element) => element !== '');
          return details;
        }
      })
      .catch((e) => {
        console.error(e);
      })) as string[];
  }
}
