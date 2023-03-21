import axios from 'axios';
import { load } from 'cheerio';

export class NemesisHelper {
  public static async getProductInfo(productUrl: string): Promise<string[]> {
    return (await axios(productUrl)
      .then((res) => {
        if (res.data) {
          const $ = load(res.data as string);
          const details = $('tr')
            .toArray()
            .map((node) => $(node).text().trim());
          return details;
        }
      })
      .catch((e) => {
        console.error(e);
      })) as string[];
  }
}
