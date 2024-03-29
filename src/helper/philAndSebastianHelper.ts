import axios from 'axios';
import { load } from 'cheerio';

export class PhilAndSebastianHelper {
  public static async getProductInfo(productUrl: string): Promise<string[]> {
    return (await axios(productUrl)
      .then((res) => {
        if (res.data) {
          const $ = load(res.data as string);
          const details = $('.factsOpen')
            .find('li')
            .toArray()
            .map((node) => $(node).text());
          const tastingNotes = $('.coffeeFlavour').text();
          details.push(tastingNotes);
          return details;
        }
      })
      .catch((e) => {
        console.error(e);
      })) as string[];
  }
}
