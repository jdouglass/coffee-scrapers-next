import {
  S3Client,
  PutObjectCommandInput,
  PutObjectCommand,
  PutObjectCommandOutput,
  DeleteObjectCommand,
  DeleteObjectCommandInput,
} from '@aws-sdk/client-s3';
import axios from 'axios';
import { IProduct } from '../interfaces/product';
import { v5 as uuidv5 } from 'uuid';
import * as dotenv from 'dotenv';
import puppeteer, { PuppeteerLaunchOptions } from 'puppeteer';
import config from '../config.json';
import sharp from 'sharp';

dotenv.config();

export default class Helper {
  static namespace: string = 'f2360818-52f8-4f09-b463-8a3887f56810';
  static region: string = process.env.AWS_BUCKET_REGION;
  static bucket: string = process.env.AWS_BUCKET_NAME;
  static accessKeyId: string = process.env.AWS_ACCESS_KEY_ID;
  static secretAccessKey: string = process.env.AWS_SECRET_ACCESS_KEY;
  static s3Client: S3Client = new S3Client({
    region: this.region,
    credentials: {
      accessKeyId: this.accessKeyId,
      secretAccessKey: this.secretAccessKey,
    },
  });
  static puppeteerConfig: PuppeteerLaunchOptions = config.devMode
    ? { headless: config.isHeadless }
    : {
        headless: config.isHeadless,
        executablePath: config.chromePath,
      };

  static firstLetterUppercase = (input: string[]): string[] => {
    return input.map((word: string) => {
      while (word.includes(' ')) {
        let subWord: string[] = word.split(' ');
        subWord = this.firstLetterUppercase(subWord);
        return subWord.join(' ');
      }
      return word[0].toUpperCase() + word.substring(1).toLowerCase();
    });
  };

  static convertToUniversalVariety = (varieties: string[]): string[] => {
    for (let i = 0; i < varieties.length; i++) {
      switch (varieties[i]) {
        case 'Sl14':
        case 'Sl-14':
        case 'Sl 14':
          varieties[i] = 'SL-14';
          break;
        case 'Sl28':
        case 'Sl-28':
        case 'Sl 28':
          varieties[i] = 'SL-28';
          break;
        case 'Sl34':
        case 'Sl-34':
        case 'Sl 34':
          varieties[i] = 'SL-34';
          break;
        case 'Sl38':
          varieties[i] = 'SL-38';
          break;
        case 'Jarc 74110':
        case 'Jarc Varietals':
        case 'Landrace Cultivar':
        case 'Local Landrace':
        case 'Local Landraces':
        case 'Local Varieties':
        case 'Landrace Varieties':
        case 'Regional Landraces':
        case 'Ethiopian Landrace':
        case 'Ethiopian Landrace - 74110':
        case '71158':
        case '74110':
        case '74112':
        case '74148':
        case '74158':
          varieties[i] = 'Ethiopian Landraces';
          break;
        case 'Blend':
        case 'Field Blend':
          varieties[i] = 'Various';
          break;
        case 'Geisha':
          varieties[i] = 'Gesha';
          break;
      }
    }
    return varieties;
  };

  static convertToUniversalProcess = (process: string): string => {
    switch (process) {
      case 'Anaerobic Natural Process':
        process = 'Anaerobic Natural';
        break;
    }
    return process;
  };

  static uploadToS3 = async (product: IProduct): Promise<string> => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const key: string = uuidv5(product.productUrl, this.namespace);
    const params: PutObjectCommandInput = {
      Bucket: this.bucket,
      Key: key,
      Body: await this.getBase64FromImageUrl(product.imageUrl),
      ContentEncoding: 'base64',
      ContentType: 'image/webp',
    };
    let collectionImageUrl: string = product.imageUrl;
    try {
      const data: PutObjectCommandOutput = await this.s3Client.send(
        new PutObjectCommand(params)
      );
      collectionImageUrl =
        'https://' +
        this.bucket +
        '.s3.' +
        this.region +
        '.amazonaws.com/' +
        key;
    } catch (err) {
      console.log('Error', err);
    }
    return collectionImageUrl;
  };

  static deleteFromS3 = async (productUrl: string): Promise<void> => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const key: string = uuidv5(productUrl, this.namespace);
    const params: DeleteObjectCommandInput = {
      Bucket: this.bucket,
      Key: key,
    };
    try {
      const data = await this.s3Client.send(new DeleteObjectCommand(params));
    } catch (err) {
      console.log('Error', err);
    }
  };

  private static getBase64FromImageUrl = async (
    imageUrl: string
  ): Promise<Buffer> => {
    return await axios
      .get(imageUrl, { responseType: 'arraybuffer' })
      .then((response) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return sharp(Buffer.from(response.data))
          .resize(350, null)
          .toFormat('webp')
          .toBuffer();
      });
  };

  public static getSubtextBodyText = async (
    productUrl: string
  ): Promise<(string | null)[]> => {
    let bodyText: (string | null)[] = [''];
    const browser = await puppeteer.launch(this.puppeteerConfig);
    const page = await browser.newPage();
    await page.goto(productUrl);
    await page.waitForSelector('.shg-row');
    bodyText = await page.$$eval('.shg-row > div > div > div > p', (elements) =>
      elements.map((element) => {
        return element.textContent;
      })
    );
    await browser.close();
    return bodyText;
  };

  public static getPageTitle = async (productUrl: string): Promise<string> => {
    const browser = await puppeteer.launch(this.puppeteerConfig);
    const page = await browser.newPage();
    await page.goto(productUrl);
    const title = await page.title();
    await browser.close();
    return title;
  };

  public static getHatchProductUrls = async (
    initialProductPageUrl: string
  ): Promise<string[]> => {
    const browser = await puppeteer.launch(this.puppeteerConfig);
    const page = await browser.newPage();
    await page.goto(initialProductPageUrl);
    const initialProductPageUrls = await this.getAllHrefs(page);
    const firstPageProductUrls = initialProductPageUrls.filter(
      this.isHatchProductUrl
    );
    const productUrls = new Set(firstPageProductUrls);
    const productPageUrls = initialProductPageUrls.filter((url) => {
      return url.includes('/shop/all/');
    });
    for (const url of productPageUrls) {
      await page.goto(url);
      const pageUrls = await this.getAllHrefs(page);
      const productPageUrls = pageUrls.filter(this.isHatchProductUrl);
      for (const productUrl of productPageUrls) {
        productUrls.add(productUrl);
      }
    }
    await browser.close();
    return Array.from(productUrls);
  };

  private static isHatchProductUrl = (url: string): boolean => {
    return url.includes('/shop/product/');
  };

  private static async getAllHrefs(page: puppeteer.Page): Promise<string[]> {
    return await page.$$eval('a', (as) => as.map((a) => a.href));
  }
}
