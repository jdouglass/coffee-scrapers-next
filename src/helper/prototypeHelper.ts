import { load } from 'cheerio';

export class PrototypeHelper {
  public static getProductUrls = async (
    productPageUrl: string,
    partialProductUrl: string
  ): Promise<string[]> => {
    const productUrls = new Array<string>();
    await fetch(productPageUrl).then(async (res) => {
      if (res.ok) {
        const $ = load(await res.text());
        $('a')
          .toArray()
          .map((el) => $(el).attr('href'))
          .filter((href) => {
            if (href?.includes(partialProductUrl)) {
              productUrls.push(href);
            }
          });
      }
    });
    return productUrls;
  };
}
