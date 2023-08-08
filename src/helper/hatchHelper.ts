import { CheerioAPI, load } from 'cheerio';

export class HatchHelper {
  public static getProductUrls = async (
    productPageUrl: string,
    partialProductUrl: string,
    productCategories: string[]
  ): Promise<string[]> => {
    const productUrls = new Set<string>();
    const fetchPromises = productCategories.map(async (category) => {
      const res = await fetch(productPageUrl + `/${category}`);
      if (res.ok) {
        const $ = load(await res.text());
        $('a')
          .toArray()
          .map((el) => $(el).attr('href'))
          .filter((href) => {
            if (href?.includes(partialProductUrl)) {
              productUrls.add(href); // Use add() method of Set to add unique URLs
            }
          });
      }
    });

    await Promise.all(fetchPromises);

    return Array.from(productUrls);
  };

  public static getProductCategory = async (
    productPageUrl: string
  ): Promise<string> => {
    return (await fetch(productPageUrl).then(async (res) => {
      if (res.ok) {
        const $ = load(await res.text());
        return $('.product-category').first().text();
      }
    })) as string;
  };

  public static getProductDetails = ($: CheerioAPI): string[] => {
    return $('.product-item-description')
      .text()
      .split('\n')
      .filter((element) => element !== '');
  };
}
