import axios from 'axios';
import { load } from 'cheerio';

export class EightOunceHelper {
  public static async getProductInfo(productUrl: string): Promise<string[]> {
    return (await axios(productUrl)
      .then((res) => {
        if (res.data) {
          const $ = load(res.data as string);
          const tastingNotes = $('span[class^="main-product__block-text"]')
            .toArray()
            .map((node) => $(node).text().trim());
          const productDetails = $(
            'div[class="main-product__block-label  small-caption"]'
          )
            .toArray()
            .map((node) => $(node).text().trim());
          return tastingNotes.concat(productDetails);
        } else {
        }
      })
      .catch((e) => {
        console.error(e);
      })) as string[];
  }
}
